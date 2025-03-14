import {
  Autocomplete,
  type AutocompleteProps,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { type util } from '@unocha/hpc-data';
import { useField, useFormikContext } from 'formik';
import { type ReactNode, useEffect, useState } from 'react';
import tw from 'twin.macro';
import { REQUIRED_BORDER_STYLE } from '../../util';
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
  label: string | ReactNode;
  placeholder?: string;
  fnPromise: ({ query }: { query: string }) => Promise<util.FormObjectValue[]>;
  isMulti?: boolean;
  isAutocompleteAPI?: boolean;
  required?: boolean;
  allowChildrenRender?: boolean;
  removeOptions?: util.FormObjectValue[];
  removeOptionsFn?: (
    response: util.FormObjectValue[],
    removeOptions: util.FormObjectValue[] | undefined
  ) => util.FormObjectValue[];
  onChange?: (
    newValue:
      | NonNullable<string | util.FormObjectValue>
      | Array<string | util.FormObjectValue>
      | null
  ) => void;
  disabled?: boolean;
  /**
   *  **Warning:**
   *  This prop is used only if we are not using
   *  `Formik`, if you are using `Formik`, you don't need
   *  to pass this prop. This is for controlled fields
   */
  initialValue?: util.FormObjectValue | util.FormObjectValue[] | null;
  /**
   *  **Warning:**
   *  This prop is used only if we are not using
   *  `Formik`, if you are using `Formik`, you don't need
   *  to pass this prop. This is for controlled fields
   */
  controlledError?: string;
  observedValue?: string;
  /**
   *  If a function is passed, it will filter the options
   *  to display in the first view of the autocomplete
   */
  firstViewCondition?: (option: util.FormObjectValue) => boolean;
};

/**
 *  Removes FormObjectValue objects from `response` array if in
 *  the `removeOptions` array there is any FormObjectValue
 *  whose 'value' property equals any inside the `response`,
 *  if no `removeOptions` array provided, returns `response` array
 */
const removeOptionsFromResponse = (
  response: util.FormObjectValue[],
  removeOptions: util.FormObjectValue[] | undefined
) => {
  if (removeOptions) {
    return response.filter(
      (responseObject) =>
        !removeOptions.some(
          (removeOption) => responseObject.value === removeOption.value
        )
    );
  }
  return response;
};

const AsyncAutocompleteSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  isMulti,
  isAutocompleteAPI = true,
  required,
  allowChildrenRender,
  removeOptions,
  removeOptionsFn = removeOptionsFromResponse,
  onChange,
  disabled,
  initialValue,
  observedValue,
  controlledError,
  firstViewCondition,
}: AsyncAutocompleteSelectProps) => {
  const [controlledValue, setControlledValue] = useState<
    | NonNullable<string | util.FormObjectValue>
    | Array<string | util.FormObjectValue>
    | null
  >();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setFieldValue } = useFormikContext<util.FormObjectValue[]>();
  const [field, meta, { setTouched: setIsTouched }] =
    useField<util.FormObjectValue[]>(name);
  const [isControlledTouched, setIsControlledTouched] = useState(false);
  const [options, setOptions] = useState<util.FormObjectValue[]>([]);
  const [data, setData] = useState<util.FormObjectValue[]>([]);
  const [isFetch, setIsFetch] = useState(false);
  const [debouncedInputValue, setDebouncedInputValue] = useState('');
  const isLoading =
    isOpen && !isFetch && (!isAutocompleteAPI || inputValue.length >= 3);

  const isEmptyUncontrolledFormObjectValueArray =
    !onChange && Array.isArray(field.value) && field.value.length === 0;
  const isEmptyUncontrolledFormObjectValue = !onChange && !field.value;
  const isEmptyControlledFormObjectValueArray =
    onChange &&
    ((Array.isArray(controlledValue) && controlledValue.length === 0) ||
      (Array.isArray(initialValue) && initialValue.length === 0));
  const isEmptyControlledFormObjectValue =
    onChange && !(controlledValue ?? initialValue);

  useEffect(() => {
    const delay = isFetch ? 0 : 300;
    const debounceTimer = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [inputValue, isFetch]);

  useEffect(() => {
    let isActive = true;
    const input = debouncedInputValue;

    if (isAutocompleteAPI && (input === '' || input.length < 3)) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
      return;
    }
    if (data.length > 0 && (input.length >= 3 || !isAutocompleteAPI)) {
      if (firstViewCondition && input.length === 0) {
        setOptions(data.filter(firstViewCondition));
      } else {
        setOptions(
          data.filter((x) =>
            x.displayLabel.toUpperCase().includes(input.toUpperCase())
          )
        );
      }
    }

    if (!isLoading && !(typeof field.value === 'string')) {
      return;
    }
    (async () => {
      try {
        let response: util.FormObjectValue[];
        if (fnPromise) {
          //  Don't include trailing spaces on query
          const query =
            input.at(-1) === ' ' && input.length > 3
              ? input.trimEnd()
              : input;
          response = await fnPromise({
            query,
          });
        } else {
          response = field.value;
        }
        const filteredResponse = removeOptionsFn(response, removeOptions);
        setData(filteredResponse);
        if (isActive) {
          if (firstViewCondition) {
            setOptions(filteredResponse.filter(firstViewCondition));
          } else {
            setOptions(filteredResponse);
          }
        }
        setIsFetch(true);
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [debouncedInputValue, isOpen]);

  useEffect(() => {
    if (!isOpen && isAutocompleteAPI) {
      setOptions([]);
      setData([]);
      setIsFetch(false);
    }
  }, [isOpen, isAutocompleteAPI, fnPromise]);

  useEffect(() => {
    setOptions([]);
    setData([]);
    setIsFetch(false);
  }, [observedValue]);

  /*
   *  Here we observe when the value changes by user
   *  actions, for instance, if another field triggers
   *  a change in the value of this field, we want to
   *  update the controlled value to see if the required
   *  field is filled or not.
   */
  useEffect(() => {
    setControlledValue(field.value);
  }, [field.value]);

  const configAutocomplete: AutocompleteProps<
    util.FormObjectValue,
    boolean,
    boolean,
    boolean
  > = {
    ...field,
    multiple: isMulti,
    disabled,
    onOpen: () => {
      setIsOpen(true);
      setIsTouched(true);
      setIsControlledTouched(true);
    },
    onClose: () => {
      setIsOpen(false);
    },
    open: isOpen,
    isOptionEqualToValue: (option, value) => option.value === value?.value,
    options,
    getOptionLabel: (op) =>
      typeof op === 'string' ? op : op.displayLabel ?? '',
    filterSelectedOptions: true,
    filterOptions: (x) => x,
    ChipProps: { size: 'small' },
    onChange: (_, newValue) => {
      if (onChange) {
        setControlledValue(newValue);
        onChange(newValue);
      } else {
        //  For multiple selections, newValue will be an array of selected values
        setFieldValue(name, newValue);
      }
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
      value.map((option, index) => {
        const chipOptions = {
          label: option.displayLabel,
          ...getTagProps({ index }),
          sx: option.chipColor ? { bgcolor: option.chipColor } : {},
        };
        return (
          <Tooltip
            title={
              option.tooltip
                ? `${chipOptions.label} [${option.tooltip}]`
                : chipOptions.label
            }
            key={`${name}-${option.value}`}
          >
            <Chip {...chipOptions} />
          </Tooltip>
        );
      }),
    getOptionDisabled: (option) =>
      isMulti === true &&
      field.value.some((a) => a.parent?.value === option.value),
    renderInput: (params) => (
      <StyledTextField
        {...params}
        sx={
          required &&
          (isEmptyUncontrolledFormObjectValueArray ||
            isEmptyUncontrolledFormObjectValue ||
            isEmptyControlledFormObjectValueArray ||
            isEmptyControlledFormObjectValue)
            ? REQUIRED_BORDER_STYLE
            : undefined
        }
        size="small"
        label={label}
        required={required}
        placeholder={placeholder}
        inputProps={{
          ...params.inputProps,
          //  Needed to support native <input /> required on 'multiple' autocomplete select
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
        error={
          (meta.touched && !!meta.error) ||
          (isControlledTouched && !!controlledError)
        }
        helperText={
          (meta.touched && meta.error) ||
          (isControlledTouched && controlledError)
            ? meta.error ?? controlledError
            : undefined
        }
      />
    ),
  };

  return (
    <StyledAutocomplete
      {...configAutocomplete}
      {...(initialValue !== undefined ? { value: initialValue } : {})}
    />
  );
};

export default AsyncAutocompleteSelect;
