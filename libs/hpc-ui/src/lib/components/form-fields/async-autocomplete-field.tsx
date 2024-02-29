import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  Chip,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import { styled } from '@mui/material/styles';
import { useField, useFormikContext, FormikValues, FormikErrors } from 'formik';
import InputEntry from './input-entry';
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
  forms,
  governingEntities,
  flows,
} from '@unocha/hpc-data';
import tw from 'twin.macro';
import { FormObjectValue } from './types/types';
import { THEME } from '../../theme';

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
  | organizations.GetOrganizationsResult
  | locations.GetLocationsAutocompleteResult
  | categories.GetCategoriesResult
  | emergencies.GetEmergenciesAutocompleteResult
  | plans.GetPlansAutocompleteResult
  | projects.GetProjectsAutocompleteResult
  | globalClusters.GetGlobalClustersResult
  | usageYears.GetUsageYearsResult
  | governingEntities.GetGoverningEntityResult
  | flows.FlowResult
  | currencies.GetCurrenciesResult;

type AsyncAutocompleteSelectProps = {
  name: string;
  label: string;
  placeholder?: string;
  fnPromise?: ({ query }: { query: string }) => Promise<APIAutocompleteResult>;
  optionsData?: APIAutocompleteResult;
  category?: categories.CategoryGroup;
  isMulti?: boolean;
  isAutocompleteAPI?: boolean;
  requiered?: boolean;
  behavior?: string;
  onChange?: (name: string, value: any) => void;
  entryInfo?: forms.InputEntryType[];
  rejectInputEntry?: (key: string) => void;
  withoutFormik?: boolean;
  setFieldValue?: any;
};

const AsyncAutocompleteSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  optionsData,
  isMulti,
  category,
  isAutocompleteAPI,
  requiered,
  behavior,
  onChange,
  entryInfo,
  rejectInputEntry,
  withoutFormik = false,
  setFieldValue,
  ...otherProps
}: AsyncAutocompleteSelectProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [multipleValuesSelected, setMultipleValueSelected] = useState(false);
  const [options, setOptions] = useState<readonly FormObjectValue[]>([]);
  const [data, setData] = useState<Array<FormObjectValue>>([]);
  const [isFetch, setIsFetch] = useState(false);
  const [isUsageYear, setisUsageYear] = useState(false);
  const [enabledValue, setEnabledValue] = useState('');

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
  function isGlobalClustersResult(
    result: APIAutocompleteResult
  ): result is globalClusters.GetGlobalClustersResult {
    return globalClusters.GET_GLOBAL_CLUSTERS_RESULT.is(result);
  }
  function isCurrenciesResult(
    result: APIAutocompleteResult
  ): result is currencies.GetCurrenciesResult {
    return currencies.GET_CURRENCIES_RESULT.is(result);
  }
  function isProjectsResult(
    result: APIAutocompleteResult
  ): result is projects.GetProjectsAutocompleteResult {
    return projects.GET_PROJECTS_AUTOCOMPLETE_RESULT.is(result);
  }
  function isPlansResult(
    result: APIAutocompleteResult
  ): result is plans.GetPlansAutocompleteResult {
    return plans.GET_PLANS_AUTOCOMPLETE_RESULT.is(result);
  }
  function isFlowsResult(
    result: APIAutocompleteResult
  ): result is flows.FlowResult {
    return flows.FLOW_RESULT.is(result);
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

    // if (!loading && !(typeof field.value === 'string')) {
    //   return undefined;
    // }
    (async () => {
      try {
        let response: APIAutocompleteResult;
        if (fnPromise) {
          response = await fnPromise({
            query: category ? category : inputValue,
          });
        } else {
          response = optionsData || [];
        }
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
          } else if (isGlobalClustersResult(response)) {
            return {
              displayLabel: (responseValue as globalClusters.GlobalCluster)
                .name,
              value: responseValue.id,
            };
          } else if (isPlansResult(response)) {
            return {
              displayLabel: (responseValue as plans.Plan).name,
              value: responseValue.id,
            };
          } else if (isCurrenciesResult(response)) {
            return {
              displayLabel: (responseValue as currencies.Currency).code,
              value: responseValue.id,
            };
          } else if (isProjectsResult(response)) {
            return {
              displayLabel: `${(responseValue as projects.Project).name} [${
                (responseValue as projects.Project).code
              }]`,
              value: responseValue.id,
            };
          } else if (
            name === 'sourceGoverningEntities' ||
            name === 'destinationGoverningEntities'
          ) {
            return {
              displayLabel: (responseValue as governingEntities.GoverningEntity)
                .governingEntityVersion.name,
              value: responseValue.id,
            };
          } else if (name === 'parentFlow' || name === 'childFlow') {
            const value = responseValue as flows.Flow;
            return {
              displayLabel: `Flow ${value.id}: ${value.description} Source: ${
                value.organizations && value.organizations[0]
                  ? value.organizations[0].name
                  : ''
              } | Destination: ${
                value.organizations && value.organizations[1]
                  ? value.organizations[1].name
                  : ''
              }`,
              value: JSON.stringify(responseValue),
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

  // useEffect(() => {
  //   if (field.value && typeof field.value === 'string' && options.length > 0) {
  //     helpers.setValue(
  //       options.filter(
  //         (option) => option.displayLabel === (field.value as unknown)
  //       )[0]
  //     );
  //   }
  // }, [field.value, options, helpers]);

  if (!withoutFormik) {
    return (
      <FormikAsyncAutocompleteSelect
        name={name}
        label={label}
        placeholder={placeholder}
        fnPromise={fnPromise}
        optionsData={optionsData}
        isMulti={isMulti}
        category={category}
        isAutocompleteAPI={isAutocompleteAPI}
        requiered={requiered}
        behavior={behavior}
        onChange={onChange}
        entryInfo={entryInfo}
        rejectInputEntry={rejectInputEntry}
      />
    );
  }
  // const [field, meta, helpers] = useField<
  //   FormObjectValue[] | FormObjectValue | string
  // >(name);
  // const { values, setFieldValue } = useFormikContext<FormikValues>();

  const configAutocomplete: AutocompleteProps<
    FormObjectValue,
    boolean,
    boolean,
    boolean
  > = {
    // ...field,
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
    getOptionDisabled: (option) =>
      enabledValue !== '' && option.value !== enabledValue,
    filterSelectedOptions: true,
    filterOptions: (x) => x,
    ChipProps: { size: 'small' },
    onChange: (_, newValue) => {
      // For multiple selections, newValue will be an array of selected values
      if (onChange) {
        onChange(name, newValue);
      }
      console.log(newValue);
      setFieldValue(name, newValue);
      setMultipleValueSelected(Array.isArray(newValue) && newValue.length > 1);
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
    renderTags: (value, getTagProps) => {
      return value.map((option, index) => (
        <Chip
          label={
            <>
              {option.displayLabel}
              {option.isTransferred && (
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: THEME.colors.secondary.light1,
                    color: THEME.colors.panel.bg,
                    fontWeight: 800,
                    marginLeft: 6,
                  }}
                >
                  T
                </span>
              )}
              {option.isInferred && (
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: THEME.colors.primary.light,
                    color: THEME.colors.panel.bg,
                    fontWeight: 800,
                    marginLeft: 6,
                  }}
                >
                  I
                </span>
              )}
            </>
          }
          {...getTagProps({ index })}
          sx={option?.isAutoFilled ? { bgcolor: '#FFCC00' } : {}}
        />
      ));
    },
    renderInput: (params) => (
      <StyledTextField
        {...params}
        size="small"
        label={label}
        required={requiered}
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

  return (
    <>
      <StyledAutocomplete {...configAutocomplete} />
      {entryInfo &&
        entryInfo.length > 0 &&
        rejectInputEntry &&
        entryInfo.map((entry, index) => (
          <InputEntry
            key={index}
            info={entry}
            setValue={() => {
              // setFieldValue(name, entry.value);
              rejectInputEntry(name);
            }}
            rejectValue={() => {
              rejectInputEntry(name);
            }}
          />
        ))}
    </>
  );
};

const FormikAsyncAutocompleteSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  optionsData,
  isMulti,
  category,
  isAutocompleteAPI,
  requiered,
  behavior,
  onChange,
  entryInfo,
  rejectInputEntry,
  ...otherProps
}: AsyncAutocompleteSelectProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [multipleValuesSelected, setMultipleValueSelected] = useState(false);
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const [field, meta, helpers] = useField<
    FormObjectValue[] | FormObjectValue | string
  >(name);
  const [options, setOptions] = useState<readonly FormObjectValue[]>([]);
  const [data, setData] = useState<Array<FormObjectValue>>([]);
  const [isFetch, setIsFetch] = useState(false);
  const [isUsageYear, setisUsageYear] = useState(false);
  const [enabledValue, setEnabledValue] = useState('');
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
  function isGlobalClustersResult(
    result: APIAutocompleteResult
  ): result is globalClusters.GetGlobalClustersResult {
    return globalClusters.GET_GLOBAL_CLUSTERS_RESULT.is(result);
  }
  function isCurrenciesResult(
    result: APIAutocompleteResult
  ): result is currencies.GetCurrenciesResult {
    return currencies.GET_CURRENCIES_RESULT.is(result);
  }
  function isProjectsResult(
    result: APIAutocompleteResult
  ): result is projects.GetProjectsAutocompleteResult {
    return projects.GET_PROJECTS_AUTOCOMPLETE_RESULT.is(result);
  }
  function isPlansResult(
    result: APIAutocompleteResult
  ): result is plans.GetPlansAutocompleteResult {
    return plans.GET_PLANS_AUTOCOMPLETE_RESULT.is(result);
  }
  const onBlur = useCallback(() => helpers.setTouched(true), [helpers]);
  const errorMsg = useMemo(
    () =>
      meta.touched && Boolean(meta.error)
        ? meta.touched && (meta.error as string)
        : null,
    [meta.touched, meta.error]
  );

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

    if (!loading && !(typeof field.value === 'string')) {
      return undefined;
    }
    (async () => {
      try {
        let response: APIAutocompleteResult;
        if (fnPromise) {
          response = await fnPromise({
            query: category ? category : inputValue,
          });
        } else {
          response = optionsData || [];
        }
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
          } else if (isGlobalClustersResult(response)) {
            return {
              displayLabel: (responseValue as globalClusters.GlobalCluster)
                .name,
              value: responseValue.id,
            };
          } else if (isPlansResult(response)) {
            return {
              displayLabel: (responseValue as plans.Plan).name,
              value: responseValue.id,
            };
          } else if (isCurrenciesResult(response)) {
            return {
              displayLabel: (responseValue as currencies.Currency).code,
              value: responseValue.id,
            };
          } else if (isProjectsResult(response)) {
            return {
              displayLabel: `${(responseValue as projects.Project).name} [${
                (responseValue as projects.Project).code
              }]`,
              value: responseValue.id,
            };
          } else if (
            name === 'sourceGoverningEntities' ||
            name === 'destinationGoverningEntities'
          ) {
            return {
              displayLabel: (responseValue as governingEntities.GoverningEntity)
                .governingEntityVersion.name,
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
    setMultipleValueSelected(
      Array.isArray(values[name]) && values[name].length > 1
    );
    if (name === 'sourcePlans' || name === 'destinationPlans') {
      if (values[name].length === 1) {
        setEnabledValue(values[name][0].value);
      } else {
        setEnabledValue('');
      }
    }
  }, [values, name, setMultipleValueSelected]);

  useEffect(() => {
    if (!open && !category && isAutocompleteAPI) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
    }
  }, [open]);

  useEffect(() => {
    if (field.value && typeof field.value === 'string' && options.length > 0) {
      helpers.setValue(
        options.filter(
          (option) => option.displayLabel === (field.value as unknown)
        )[0]
      );
    }
  }, [field.value, options, helpers]);

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
    getOptionDisabled: (option) =>
      enabledValue !== '' && option.value !== enabledValue,
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
        <li {...props} key={option.value}>
          {option.displayLabel}
        </li>
      );
    },
    renderTags: (value, getTagProps) => {
      return value.map((option, index) => (
        <Chip
          label={
            <>
              {option.displayLabel}
              {option.isTransferred && (
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: THEME.colors.secondary.light1,
                    color: THEME.colors.panel.bg,
                    fontWeight: 800,
                    marginLeft: 6,
                  }}
                >
                  T
                </span>
              )}
              {option.isInferred && (
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: THEME.colors.primary.light,
                    color: THEME.colors.panel.bg,
                    fontWeight: 800,
                    marginLeft: 6,
                  }}
                >
                  I
                </span>
              )}
            </>
          }
          {...getTagProps({ index })}
          sx={option?.isAutoFilled ? { bgcolor: '#FFCC00' } : {}}
        />
      ));
    },
    onBlur,
    renderInput: (params) => (
      <StyledTextField
        {...params}
        size="small"
        label={label}
        required={requiered}
        error={!!errorMsg}
        helperText={errorMsg}
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

  return (
    <>
      <StyledAutocomplete {...configAutocomplete} />
      {entryInfo &&
        entryInfo.length > 0 &&
        rejectInputEntry &&
        entryInfo.map((entry, index) => (
          <InputEntry
            key={index}
            info={entry}
            setValue={() => {
              setFieldValue(name, entry.value);
              rejectInputEntry(name);
            }}
            rejectValue={() => {
              rejectInputEntry(name);
            }}
          />
        ))}
    </>
  );
};

AsyncAutocompleteSelect.defaultProps = {
  isAutocompleteAPI: true,
};
export default AsyncAutocompleteSelect;
