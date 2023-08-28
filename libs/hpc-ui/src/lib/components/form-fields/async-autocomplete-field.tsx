import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { locations, organizations } from '@unocha/hpc-data';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';

const StyledTextField = tw(TextField)`
    min-w-[10rem]
    w-full`;
const StyledAutocomplete = tw(Autocomplete)`
    min-w-[10rem]
    w-full`;

type APIAutocompleteResult =
  | organizations.GetOrganizationsAutocompleteResult
  | locations.GetLocationsAutocompleteResult;

const AsyncAutocompleteSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  isMulti,
  ...otherProps
}: {
  name: string;
  label: string;
  placeholder?: string;
  fnPromise: ({ query }: { query: string }) => Promise<APIAutocompleteResult>;
  isMulti?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);
  const [options, setOptions] = useState<readonly string[]>([]);
  const [data, setData] = useState<readonly string[]>([]);
  const [isFetch, setIsFetch] = useState(false);
  const loading = open && !isFetch;

  useEffect(() => {
    let active = true;
    if (inputValue === '' || inputValue.length < 3) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
      return undefined;
    }
    if (data.length > 0 && inputValue.length > 3) {
      setOptions(
        data.filter((x) => x.toUpperCase().includes(inputValue.toUpperCase()))
      );
    }

    if (!loading) {
      return undefined;
    }
    (async () => {
      try {
        const response = await fnPromise({ query: inputValue });
        const parsedResponse = response.map(
          (organization) => organization.name
        );
        setData(parsedResponse);
        if (active) {
          setOptions(parsedResponse);
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
    if (!open) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
    }
  }, [open]);

  const configAutocomplete: AutocompleteProps<
    string,
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
    isOptionEqualToValue: (option, value) => option === value,
    options: options,
    getOptionLabel: (op) => op,
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

  return <StyledAutocomplete {...configAutocomplete} />;
};

export default AsyncAutocompleteSelect;
