import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { useEffect, useState, memo } from 'react';
import tw from 'twin.macro';
import { FormObjectValue } from '@unocha/hpc-data';
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
    w-full`;

type AsyncAutocompleteSelectProps = {
  name: string;
  label: string;
  placeholder?: string;
  fnPromise: ({ query }: { query: string }) => Promise<Array<FormObjectValue>>;
  isMulti?: boolean;
  isAutocompleteAPI?: boolean;
  error?: (metaError: string) => string | undefined;
  required?: boolean;
  allowChildrenRender?: boolean;
  removeOptions?: Array<FormObjectValue>;
};

/** Removes FormObjectValue objects from first array if in the second array there is any FormObjectValue whose 'value' property
 *  equals any inside the firstArray, if no second array provided, returns first array */
const removeFormObjectValueFromFirstArray = (
  firstArray: Array<FormObjectValue>,
  secondArray: Array<FormObjectValue> | undefined
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

const AsyncAutocompleteSelect = memo(
  ({
    name,
    label,
    placeholder,
    fnPromise,
    isMulti,
    error,
    isAutocompleteAPI = true,
    required,
    allowChildrenRender,
    removeOptions,
    ...otherProps
  }: AsyncAutocompleteSelectProps) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { setFieldValue } = useFormikContext<Array<FormObjectValue>>();
    const [field, meta] = useField<Array<FormObjectValue>>(name);
    const [options, setOptions] = useState<Array<FormObjectValue>>([]);
    const [data, setData] = useState<Array<FormObjectValue>>([]);
    const [isFetch, setIsFetch] = useState(false);
    const [debouncedInputValue, setDebouncedInputValue] = useState('');
    const loading =
      open && !isFetch && (!isAutocompleteAPI || inputValue.length >= 3);
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
      if (!open && isAutocompleteAPI) {
        setOptions([]);
        setData([]);
        setIsFetch(false);
      }
    }, [open]);

    useEffect(() => {
      let active = true;
      if (
        isAutocompleteAPI &&
        (debouncedInputValue === '' || debouncedInputValue.length < 3)
      ) {
        setOptions([]);
        setData([]);
        setIsFetch(false);
        return undefined;
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

      if (!loading && !(typeof field.value === 'string')) {
        return undefined;
      }
      (async () => {
        try {
          let response: FormObjectValue[];
          if (fnPromise) {
            response = await fnPromise({
              query: debouncedInputValue,
            });
          } else {
            response = field.value;
          }
          setData(removeFormObjectValueFromFirstArray(response, removeOptions));
          if (active) {
            setOptions(response);
          }
          setIsFetch(true);
        } catch (error) {
          console.error(error);
        }
      })();

      return () => {
        active = false;
      };
    }, [loading, debouncedInputValue]);

    const configAutocomplete: AutocompleteProps<
      FormObjectValue,
      boolean,
      boolean,
      boolean
    > = {
      ...field,
      ...otherProps,
      multiple: isMulti,
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
      onInputChange: (_, newInputValue) => {
        setInputValue(newInputValue);
      },
      loading: loading,
      renderOption: (props, option) => {
        if (allowChildrenRender && option.parent) {
          return (
            <ChildrenOption {...props} key={option.value}>
              {option.displayLabel}
            </ChildrenOption>
          );
        } else {
          return (
            <li {...props} key={option.value}>
              {option.displayLabel}
            </li>
          );
        }
      },
      getOptionDisabled: (option) =>
        isMulti === true &&
        field.value.find((a) => a.parent?.value === option.value) !== undefined,
      renderInput: (params) => (
        <StyledTextField
          {...params}
          size="small"
          placeholder={placeholder}
          label={`${label}${required ? '*' : ''}`}
          inputProps={{
            ...params.inputProps,
            /** Needed to support native <input /> required on 'multiple' autocomplete select */
            required:
              isMulti && required ? field.value.length === 0 : undefined,
          }}
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
          error={meta && meta.touched && meta.error ? true : false}
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
  }
);

export default AsyncAutocompleteSelect;
