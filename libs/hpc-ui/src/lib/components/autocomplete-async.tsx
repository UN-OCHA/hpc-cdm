import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  Checkbox,
  CircularProgress,
  TextField,
} from '@mui/material';
import debounce from 'lodash/debounce';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

type FixedMUIProps =
  | 'renderInput'
  | 'renderOption'
  | 'options'
  | 'loading'
  | 'openOnFocus'
  | 'disableCloseOnSelect';

type MUIProps<T, Multiple extends boolean | undefined> = AutocompleteProps<
  T,
  Multiple,
  false,
  false
>;

interface Props<T, Multiple extends boolean | undefined>
  extends Omit<MUIProps<T, Multiple>, FixedMUIProps> {
  searchOnType?: boolean;
  strings: {
    label: ReactNode;
    placeholder?: string;
    searchError: string;
    validation: {
      minLength: string;
    };
  };
  getOptions: (params: unknown) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
}

/**
 * A standardised autocomplete select box based on MUI's Autocomplete
 * Unlike MUI Autocomplete, options must be lazy loaded on search (options prop is disabled)
 */
export default function AutocompleteAsync<
  T,
  Multiple extends boolean | undefined
>(props: Props<T, Multiple>) {
  const { strings, getOptions, getOptionLabel, searchOnType, ...rest } = props;
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [noOptionsText, setNoOptionsText] = useState<string | null>(
    searchOnType ? strings.validation.minLength : null
  );

  const minInputChars = 3;

  const debouncedSearch = useMemo(
    () =>
      debounce((params = {}) => {
        getOptions(params)
          .then((result) =>
            setOptions(
              result.sort((a, b) =>
                getOptionLabel(a).localeCompare(getOptionLabel(b))
              )
            )
          )
          .catch(() => setNoOptionsText(strings.searchError))
          .finally(() => setLoading(false));
      }, 500),
    [getOptions, getOptionLabel, strings.searchError]
  );

  useEffect(() => {
    if (!searchOnType) {
      setLoading(true);
      debouncedSearch();
    }
  }, [debouncedSearch, searchOnType]);

  const fixedMUIProps: Pick<MUIProps<T, Multiple>, FixedMUIProps> = {
    renderInput: (params: AutocompleteRenderInputParams) => {
      return (
        <TextField
          {...params}
          label={strings.label}
          placeholder={strings.placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      );
    },
    renderOption: (props, option, { selected }) => {
      return (
        <li
          {...props}
          key={`${getOptionLabel(option)}_${(option as { id?: number }).id}`}
        >
          {rest.multiple && (
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
          )}
          {getOptionLabel(option)}
        </li>
      );
    },
    options,
    loading,
    openOnFocus: true,
    disableCloseOnSelect: rest.multiple,
  };

  const autocompleteProps: MUIProps<T, Multiple> = {
    getOptionLabel,
    ...rest,
    ...fixedMUIProps,
    ...(noOptionsText && {
      noOptionsText,
    }),
    ...(searchOnType && {
      filterOptions: (x) => x,
    }),
    onInputChange: useCallback(
      (event, value, reason) => {
        if (rest.onInputChange) {
          rest.onInputChange(event, value, reason);
        }

        if (searchOnType) {
          if (value.length < minInputChars) {
            setNoOptionsText(strings.validation.minLength);
            setLoading(false);
            debouncedSearch.cancel();

            // reason is 'reset' when an option is selected from the list
            if (reason !== 'reset') {
              setOptions([]);
            }
          } else {
            setNoOptionsText(null);
            setLoading(true);
            debouncedSearch({
              search: value,
            });
          }
        }
      },
      [debouncedSearch, rest, strings.validation.minLength, searchOnType]
    ),
    onClose: (event, reason) => {
      if (rest.onClose) {
        rest.onClose(event, reason);
      }
      if (searchOnType) {
        setLoading(false);
        setOptions([]);
      }
    },
  };

  return <Autocomplete {...autocompleteProps} />;
}
