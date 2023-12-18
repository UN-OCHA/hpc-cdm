import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import {
  categories,
  emergencies,
  globalClusters,
  locations,
  organizations,
  plans,
  projects,
  usageYears,
} from '@unocha/hpc-data';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { FormObjectValue } from './types/types';

const StyledTextField = tw(TextField)`
    min-w-[10rem]
    w-full`;
const StyledAutocomplete = tw(Autocomplete)`
    min-w-[10rem]
    w-full`;

type APIAutocompleteResult =
  | organizations.GetOrganizationsResult
  | locations.GetLocationsAutocompleteResult
  | categories.GetCategoriesResult
  | emergencies.GetEmergenciesAutocompleteResult
  | plans.GetPlansAutocompleteResult
  | projects.GetProjectsAutocompleteResult
  | globalClusters.GetGlobalClustersResult
  | usageYears.GetUsageYearsResult;

type AsyncAutocompleteSelectProps = {
  name: string;
  label: string;
  placeholder?: string;
  fnPromise: ({ query }: { query: string }) => Promise<APIAutocompleteResult>;
  category?: categories.CategoryGroup;
  isMulti?: boolean;
  isAutocompleteAPI?: boolean;
};
const AsyncAutocompleteSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  isMulti,
  category,
  isAutocompleteAPI,
  ...otherProps
}: AsyncAutocompleteSelectProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setFieldValue } = useFormikContext<Array<FormObjectValue>>();
  const [field, meta] = useField<Array<FormObjectValue>>(name);
  const [options, setOptions] = useState<Array<FormObjectValue>>([]);
  const [data, setData] = useState<Array<FormObjectValue>>([]);
  const [isFetch, setIsFetch] = useState(false);
  const [isUsageYear, setisUsageYear] = useState(false);
  const loading =
    open &&
    !isFetch &&
    (!isAutocompleteAPI || inputValue.length >= 3 || category !== undefined);
  const actualYear = new Date().getFullYear();
  function isUsageYearsResult(
    result: APIAutocompleteResult
  ): result is usageYears.GetUsageYearsResult {
    return usageYears.GET_USAGE_YEARS_RESULT.is(result);
  }
  function isOrganizationsResult(
    result: APIAutocompleteResult
  ): result is organizations.GetOrganizationsResult {
    return organizations.GET_ORGANIZATIONS_RESULT.is(result);
  }

  useEffect(() => {
    let active = true;
    if (
      !category &&
      isAutocompleteAPI &&
      (inputValue === '' || inputValue.length < 3)
    ) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
      return undefined;
    }
    if (
      (data.length > 0 &&
        (inputValue.length >= 3 || category || !isAutocompleteAPI) &&
        (!isUsageYear || inputValue.length > 0)) ||
      (isUsageYear &&
        inputValue.length === 0 &&
        options.at(0)?.displayLabel !== (actualYear - 5).toString() &&
        options.at(-1)?.displayLabel !== (actualYear + 5).toString())
    ) {
      setOptions(
        data
          .filter((x) =>
            x.displayLabel.toUpperCase().includes(inputValue.toUpperCase())
          )
          .sort((a, b) =>
            a.displayLabel < b.displayLabel
              ? -1
              : a.displayLabel > b.displayLabel
              ? 1
              : 0
          )
      );
    }

    if (!loading) {
      return undefined;
    }
    (async () => {
      try {
        const response = await fnPromise({
          query: category ? category : inputValue,
        });

        const parsedResponse = response.map((responseValue) => {
          if (isUsageYearsResult(response)) {
            return {
              displayLabel: (responseValue as usageYears.UsageYear).year,
              value: responseValue.id,
            };
          } else if (isOrganizationsResult(response)) {
            const org = responseValue as organizations.Organization;
            return {
              displayLabel: `${org.name} [${org.abbreviation}]`,
              value: responseValue.id,
            };
          } else {
            return {
              displayLabel: (responseValue as { id: number; name: string })
                .name,
              value: responseValue.id,
            };
          }
        });

        setData(parsedResponse);
        if (active) {
          if (isUsageYearsResult(response)) {
            setisUsageYear(true);

            const preOptions = parsedResponse.filter((item) => {
              const year = parseInt(item.displayLabel, 10);
              if (year >= actualYear - 5 && year <= actualYear + 5) {
                return item;
              }
            });
            setOptions(preOptions);
          } else {
            setOptions(parsedResponse);
          }
        }
        setIsFetch(true);
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, inputValue]);

  useEffect(() => {
    if (!open && !category && isAutocompleteAPI) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
    }
  }, [open]);

  const configAutocomplete: AutocompleteProps<
    FormObjectValue,
    boolean,
    boolean,
    boolean
  > = {
    ...field,
    ...otherProps,
    multiple: isMulti,
    placeholder: placeholder,
    onOpen: () => {
      setOpen(true);
    },
    onClose: () => {
      setOpen(false);
    },
    open: open,
    isOptionEqualToValue: (option, value) => option.value === value.value,
    options: options,
    getOptionLabel: (op) => (typeof op === 'string' ? op : op.displayLabel),
    filterSelectedOptions: true,
    filterOptions: (x) => x,
    ChipProps: { size: 'small' },
    onChange: (_, newValue) => {
      // For multiple selections, newValue will be an array of selected values
      setFieldValue(name, newValue);
    },
    onInputChange: (event, newInputValue) => {
      setInputValue(newInputValue);
    },
    loading: loading,
    renderOption: (props, option) => {
      return (
        <li {...props} key={option.value}>
          {option.displayLabel}
        </li>
      );
    },
    renderInput: (params) => (
      <StyledTextField
        {...params}
        size="small"
        label={label}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
      />
    ),
  };
  if (meta && meta.error && meta.touched) {
    console.log(meta.error);
  }
  return <StyledAutocomplete {...configAutocomplete} />;
};

AsyncAutocompleteSelect.defaultProps = {
  isAutocompleteAPI: true,
};
export default AsyncAutocompleteSelect;
