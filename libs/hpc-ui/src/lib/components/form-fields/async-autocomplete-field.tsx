import {
  Autocomplete,
  type AutocompleteProps,
  CircularProgress,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { type FormObjectValue } from '@unocha/hpc-data';
import { StyledTextField } from './text-field';

const StyledAutocomplete = tw(Autocomplete)`
  min-w-[10rem]
  w-full
`;

type AsyncAutocompleteSelectProps = {
  name: string;
  label: string;
  placeholder?: string;
  fnPromise: ({ query }: { query: string }) => Promise<FormObjectValue[]>;
  isMulti?: boolean;
  isAutocompleteAPI?: boolean;
  error?: (metaError: string) => string | undefined;
  required?: boolean;
};
const AsyncAutocompleteSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  isMulti,
  error,
  isAutocompleteAPI,
  required,
}: AsyncAutocompleteSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setFieldValue } = useFormikContext<FormObjectValue[]>();
  const [field, meta] = useField<FormObjectValue[]>(name);
  const [options, setOptions] = useState<FormObjectValue[]>([]);
  const [data, setData] = useState<FormObjectValue[]>([]);
  const [isFetch, setIsFetch] = useState(false);
  const isLoading =
    isOpen && !isFetch && (!isAutocompleteAPI || inputValue.length >= 3);

  useEffect(() => {
    let isActive = true;
    if (isAutocompleteAPI && (inputValue === '' || inputValue.length < 3)) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
      return;
    }
    if (data.length > 0 && (inputValue.length >= 3 || !isAutocompleteAPI)) {
      setOptions(
        data.filter((x) =>
          x.displayLabel.toUpperCase().includes(inputValue.toUpperCase())
        )
      );
    }

    if (!isLoading) {
      return;
    }
    (async () => {
      try {
        const response = await fnPromise({
          query: inputValue,
        });
        setData(response);
        console.log(response);
        if (isActive) {
          setOptions(response);
        }
        setIsFetch(true);
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [isOpen, inputValue]);

  useEffect(() => {
    if (!isOpen && isAutocompleteAPI) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
    }
  }, [isOpen, isAutocompleteAPI]);

  const configAutocomplete: AutocompleteProps<
    FormObjectValue,
    boolean,
    boolean,
    boolean
  > = {
    ...field,
    multiple: isMulti,
    onOpen: () => {
      setIsOpen(true);
    },
    onClose: () => {
      setIsOpen(false);
    },
    open: isOpen,
    isOptionEqualToValue: (option, value) => option.value === value.value,
    options,
    getOptionLabel: (op) => (typeof op === 'string' ? op : op.displayLabel),
    filterSelectedOptions: true,
    filterOptions: (x) => x,
    ChipProps: { size: 'small' },
    onChange: (_, newValue) => {
      // For multiple selections, newValue will be an array of selected values
      setFieldValue(name, newValue);
    },
    onInputChange: (_, newInputValue) => {
      setInputValue(newInputValue);
    },
    loading: isLoading,
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
        label={`${label}${required ? '*' : ''}`}
        placeholder={placeholder}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
        error={!!(meta && meta.touched && meta.error)}
        helperText={
          meta && meta.touched && meta.error
            ? error
              ? error(meta.error)
              : meta.error
            : undefined
        }
      />
    ),
  };

  return <StyledAutocomplete {...configAutocomplete} />;
};

AsyncAutocompleteSelect.defaultProps = {
  isAutocompleteAPI: true,
};
export default AsyncAutocompleteSelect;
