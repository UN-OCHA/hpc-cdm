import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  Checkbox,
  CircularProgress,
  TextField,
} from '@mui/material';
import debounce from 'lodash/debounce';
import { ReactNode, useCallback, useMemo, useState } from 'react';

type FixedMUIProps =
  | 'renderInput'
  | 'options'
  | 'loading'
  | 'openOnFocus'
  | 'filterOptions';

type MUIProps<T, Multiple extends boolean | undefined> = AutocompleteProps<
  T,
  Multiple,
  false,
  false
>;

interface Props<T, Multiple extends boolean | undefined>
  extends Omit<MUIProps<T, Multiple>, FixedMUIProps> {
  strings: {
    label: ReactNode;
    placeholder?: string;
    searchError: string;
    validation: {
      minLength: string;
    };
  };
  getOptions: (params: { search: string }) => Promise<T[]>;
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
  const { strings, getOptions, ...rest } = props;
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [noOptionsText, setNoOptionsText] = useState<
    { noOptionsText: string } | false
  >(false);

  const minInputChars = 3;

  const debouncedSearch = useMemo(
    () =>
      debounce((search) => {
        getOptions({
          search,
        })
          .then((result) => setOptions(result))
          .catch(() =>
            setNoOptionsText({
              noOptionsText: strings.searchError,
            })
          )
          .finally(() => setLoading(false));
      }, 500),
    [getOptions, strings.searchError]
  );

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
    options,
    loading,
    openOnFocus: true,
    filterOptions: (x) => x,
  };

  const autocompleteProps: MUIProps<T, Multiple> = {
    ...rest,
    ...fixedMUIProps,
    ...noOptionsText,
    onInputChange: useCallback(
      (event, value, reason) => {
        if (rest.onInputChange) {
          rest.onInputChange(event, value, reason);
        }

        if (value.length < minInputChars) {
          setNoOptionsText({
            noOptionsText: strings.validation.minLength,
          });
          setLoading(false);
          debouncedSearch.cancel();

          // reason is 'reset' when an option is selected from the list
          if (reason !== 'reset') {
            setOptions([]);
          }
        } else {
          setNoOptionsText(false);
          setLoading(true);
          debouncedSearch(value);
        }
      },
      [debouncedSearch, rest, strings.validation.minLength]
    ),
    onClose: (event, reason) => {
      if (rest.onClose) {
        rest.onClose(event, reason);
      }
      setLoading(false);
      setOptions([]);
    },
  };

  if (rest.multiple) {
    autocompleteProps.disableCloseOnSelect = true;
    autocompleteProps.renderOption = (props, option, { selected }) => {
      return (
        <li {...props}>
          <Checkbox style={{ marginRight: 8 }} checked={selected} />
          {rest.getOptionLabel(option)}
        </li>
      );
    };
  }

  return <Autocomplete {...autocompleteProps} />;
}
