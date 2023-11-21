import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  TooltipProps,
  tooltipClasses,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import { styled } from '@mui/material/styles';
import { useField, useFormikContext, FormikValues } from 'formik';
import {
  categories,
  emergencies,
  globalClusters,
  locations,
  organizations,
  plans,
  projects,
  usageYears,
  currencies,
} from '@unocha/hpc-data';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';

const StyledTextField = tw(TextField)`
    min-w-[10rem]
    w-full`;
const StyledAutocomplete = tw(Autocomplete)`
    min-w-[10rem]
    w-full`;

const YellowTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#ffec1a',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

type APIAutocompleteResult =
  | organizations.GetOrganizationsAutocompleteResult
  | locations.GetLocationsAutocompleteResult
  | categories.GetCategoriesResult
  | emergencies.GetEmergenciesAutocompleteResult
  | plans.GetPlansAutocompleteResult
  | projects.GetProjectsAutocompleteResult
  | globalClusters.GetGlobalClustersResult
  | usageYears.GetUsageYearsResult
  | projects.GetProjectsAutocompleteGraphQLResult
  | currencies.GetCurrenciesResult;

const AsyncAutocompleteSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  isMulti,
  category,
  isAutocompleteAPI,
  behavior,
  onChange,
  ...otherProps
}: {
  name: string;
  label: string;
  placeholder?: string;
  fnPromise: ({ query }: { query: string }) => Promise<APIAutocompleteResult>;
  category?: string;
  isMulti?: boolean;
  isAutocompleteAPI?: boolean;
  behavior?: string;
  onChange?: (name: string, value: any) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [multipleValuesSelected, setMultipleValueSelected] = useState(false);
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const [field, meta] = useField(name);
  const [options, setOptions] = useState<
    readonly { label: string; id: number }[]
  >([]);
  const [data, setData] = useState<readonly { label: string; id: number }[]>(
    []
  );
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
  ): result is organizations.GetOrganizationsAutocompleteResult {
    return organizations.GET_ORGANIZATIONS_AUTOCOMPLETE_RESULT.is(result);
  }
  function isCurrenciesResult(
    result: APIAutocompleteResult
  ): result is currencies.GetCurrenciesResult {
    return currencies.GET_CURRENCIES_RESULT.is(result);
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
        options.at(0)?.label !== (actualYear - 5).toString() &&
        options.at(-1)?.label !== (actualYear + 5).toString())
    ) {
      setOptions(
        data
          .filter((x) =>
            x.label.toUpperCase().includes(inputValue.toUpperCase())
          )
          .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
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

        let parsedResponse;

        if ('getProjects' in response) {
          parsedResponse = response.getProjects.map((responseValue: any) => {
            if (isUsageYearsResult(response)) {
              return {
                label: (responseValue as usageYears.UsageYear).year,
                id: responseValue.id,
              };
            } else if (isOrganizationsResult(response)) {
              const org = responseValue as organizations.Organization;
              return {
                label: `${org.name} [${org.abbreviation}]`,
                id: responseValue.id,
              };
            } else if (
              isCurrenciesResult(response) &&
              responseValue.planId === undefined
            ) {
              return {
                label: (responseValue as currencies.Currency).code,
                id: responseValue.id,
              };
            } else {
              return {
                label: (responseValue as { id: number; name: string }).name,
                id: responseValue.id,
              };
            }
          });
        } else {
          parsedResponse = response.map((responseValue: any) => {
            if (isUsageYearsResult(response)) {
              return {
                label: (responseValue as usageYears.UsageYear).year,
                id: responseValue.id,
              };
            } else if (isOrganizationsResult(response)) {
              const org = responseValue as organizations.Organization;
              return {
                label: `${org.name} [${org.abbreviation}]`,
                id: responseValue.id,
              };
            } else if (
              isCurrenciesResult(response) &&
              responseValue.planId === undefined
            ) {
              return {
                label: (responseValue as currencies.Currency).code,
                id: responseValue.id,
              };
            } else {
              return {
                label: (responseValue as { id: number; name: string }).name,
                id: responseValue.id,
              };
            }
          });
        }
        setData(parsedResponse);
        if (active) {
          if (isUsageYearsResult(response)) {
            setisUsageYear(true);

            const preOptions = parsedResponse.filter((item) => {
              const year = parseInt(item.label, 10);
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
    setMultipleValueSelected(
      Array.isArray(values[name]) && values[name].length > 1
    );
  }, [values, name, setMultipleValueSelected]);

  useEffect(() => {
    if (!open && !category && isAutocompleteAPI) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
    }
  }, [open]);

  const configAutocomplete: AutocompleteProps<
    { label: string; id: number },
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
    isOptionEqualToValue: (option, value) => option.id === value.id,
    options: options,
    getOptionLabel: (op) => (typeof op === 'string' ? op : op.label),
    filterSelectedOptions: true,
    filterOptions: (x) => x,
    ChipProps: { size: 'small' },
    onChange: (_, newValue) => {
      // For multiple selections, newValue will be an array of selected values
      if (onChange) {
        onChange(name, newValue);
      }
      setFieldValue(name, newValue);
      setMultipleValueSelected(Array.isArray(newValue) && newValue.length > 1);
    },
    onInputChange: (event, newInputValue) => {
      setInputValue(newInputValue);
    },
    loading: loading,
    renderOption: (props, option) => {
      return (
        <li {...props} key={option.id}>
          {option.label}
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
              {multipleValuesSelected && (
                <YellowTooltip title="Shared will be reported as possible funding for each of the selected values. Overlap will be reported as direct funding for each of the selected values.">
                  <div>
                    {behavior === 'shared' && (
                      <IconButton
                        type="button"
                        size="small"
                        aria-label="Shared behavior"
                      >
                        <ShareIcon />
                      </IconButton>
                    )}
                    {behavior === 'overlap' && (
                      <IconButton
                        type="button"
                        size="small"
                        aria-label="Overlap behavior"
                      >
                        <JoinInnerIcon />
                      </IconButton>
                    )}
                  </div>
                </YellowTooltip>
              )}
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
