import {
  Autocomplete,
  type AutocompleteProps,
  Chip,
  CircularProgress,
} from '@mui/material';
import { type util } from '@unocha/hpc-data';
import { useField, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { StyledTextField } from './text-field';

const FlexDiv = tw.div`ms-8 border-l border-l-slate-400 border-solid border-y-0 border-r-0`;
const StyledLI = tw.li`w-full max-h-min`;
const ChildrenOption = ({
  children,
  ...otherProps
}: {
  children: React.ReactNode;
}) => {
  return (
    <FlexDiv>
      <StyledLI {...otherProps}>{children}</StyledLI>
    </FlexDiv>
  );
};
const StyledAutocomplete = tw(Autocomplete)`
  min-w-[10rem]
  w-full
`;

export type AsyncAutocompleteSelectProps = {
  name: string;
  label: string;
  placeholder?: string;
  fnPromise: ({ query }: { query: string }) => Promise<util.FormObjectValue[]>;
  isMulti?: boolean;
  isAutocompleteAPI?: boolean;
  error?: (metaError: string) => string | undefined;
  required?: boolean;
  allowChildrenRender?: boolean;
  removeOptions?: util.FormObjectValue[];
};

/**
 *  Removes FormObjectValue objects from first array if in the second array
 *  there is any FormObjectValue whose 'value' property equals any inside the firstArray,
 *  if no second array provided, returns first array
 */
const removeFormObjectValueFromFirstArray = (
  firstArray: util.FormObjectValue[],
  secondArray: util.FormObjectValue[] | undefined
) => {
  if (secondArray) {
    return firstArray.filter(
      (firstArrayObject) =>
        !secondArray.some(
          (secondArrayObject) =>
            firstArrayObject.value === secondArrayObject.value
        )
    );
  }
  return firstArray;
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
  allowChildrenRender,
  removeOptions,
}: AsyncAutocompleteSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setFieldValue } = useFormikContext<util.FormObjectValue[]>();
  const [field, meta] = useField<util.FormObjectValue[]>(name);
  const [options, setOptions] = useState<util.FormObjectValue[]>([]);
  const [data, setData] = useState<util.FormObjectValue[]>([]);
  const [isFetch, setIsFetch] = useState(false);
  const [debouncedInputValue, setDebouncedInputValue] = useState('');
  const isLoading =
    isOpen && !isFetch && (!isAutocompleteAPI || inputValue.length >= 3);
  const actualYear = new Date().getFullYear();

  useEffect(() => {
    const delay = 300;
    const debounceTimer = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [inputValue]);

  useEffect(() => {
    let isActive = true;
    if (
      isAutocompleteAPI &&
      (debouncedInputValue === '' || debouncedInputValue.length < 3)
    ) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
      return;
    }
    if (
      (data.length > 0 &&
        (debouncedInputValue.length >= 3 || !isAutocompleteAPI) &&
        debouncedInputValue.length > 0) ||
      (debouncedInputValue.length === 0 &&
        options.at(0)?.displayLabel !== (actualYear - 5).toString() &&
        options.at(-1)?.displayLabel !== (actualYear + 5).toString())
    ) {
      setOptions(
        data.filter((x) =>
          x.displayLabel
            .toUpperCase()
            .includes(debouncedInputValue.toUpperCase())
        )
      );
    }

    if (!isLoading && !(typeof field.value === 'string')) {
      return;
    }
    (async () => {
      try {
        let response: util.FormObjectValue[];
        if (fnPromise) {
          response = await fnPromise({
            query: debouncedInputValue,
          });
        } else {
          response = field.value;
        }
        setData(removeFormObjectValueFromFirstArray(response, removeOptions));
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

  const configAutocomplete:  AutocompleteProps<
    util.FormObjectValue,
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
      if (allowChildrenRender && option.parent) {
        return (
          <ChildrenOption {...props} key={option.value}>
            {option.displayLabel}
          </ChildrenOption>
        );
      }
      return (
        <li {...props} key={option.value}>
          {option.displayLabel}
        </li>
      );
    },
    renderTags: (value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          label={option.displayLabel}
          {...getTagProps({ index })}
          sx={option.chipColor ? { bgcolor: option.chipColor } : {}}
        />
      )),
    getOptionDisabled: (option) =>
      isMulti === true &&
      field.value.some((a) => a.parent?.value === option.value),
    renderInput: (params) => (
      <StyledTextField
        {...params}
        size="small"
        label={`${label}${required ? '*' : ''}`}
        placeholder={placeholder}
        inputProps={{
          ...params.inputProps,
          /** Needed to support native <input /> required on 'multiple' autocomplete select */
          required: isMulti && required ? field.value.length === 0 : undefined,
        }}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {isLoading ? (
                <CircularProgress color="inherit" size={20} />
              ) : null}
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
