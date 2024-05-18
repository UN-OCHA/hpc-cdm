import React, { useMemo, useCallback } from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';
import {
  NumericFormat,
  NumericFormatProps,
  NumberFormatValues,
} from 'react-number-format';
import InputEntry from './input-entry';
import { forms } from '@unocha/hpc-data';

const StyledContainer = tw.div`
w-full
`;
export const StyledTextField = tw(TextField)`
min-w-[10rem]
w-full
`;

interface CustomProps {
  onChange: (event: {
    target: { name: string; value: string | number };
  }) => void;
  name: string;
  itemType: 'number' | 'currency';
  thousandSeparator: boolean;
}

export const NumericFormatCustom = React.forwardRef<
  NumericFormatProps,
  CustomProps
>(function NumericFormatCustom(props, ref) {
  const { onChange, name, itemType, thousandSeparator, ...others } = props;

  const handleValueChange = useCallback(
    (values: NumberFormatValues) => {
      onChange({
        target: {
          name: props.name,
          value: values.value,
        },
      });
    },
    [onChange, props.name]
  );

  return (
    <NumericFormat
      {...others}
      name={name}
      getInputRef={ref}
      onValueChange={handleValueChange}
      thousandSeparator={itemType === 'currency' || thousandSeparator}
      valueIsNumericString
    />
  );
});

interface TextFieldWrapperProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  error?: (metaError: string) => string | undefined;
  required?: boolean;
  multiline?: boolean;
  thousandSeparator?: boolean;
  rows?: number;
  entryInfo?: forms.InputEntryType | null;
  rejectInputEntry?: (key: string) => void;
}

const TextFieldWrapper = ({
  name,
  label,
  placeholder,
  type,
  textarea,
  error,
  required,
  multiline,
  rows,
  thousandSeparator,
  entryInfo,
  rejectInputEntry,
  ...otherProps
}: TextFieldWrapperProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext<string>();

  const configTextField: TextFieldProps = useMemo(() => {
    return {
      ...field,
      ...otherProps,
      label: label,
      id: name,
      multiline: textarea || multiline,
      rows: rows,
      maxRows: 5,
      required,
      placeholder: placeholder,
      size: 'small',
      type: 'text',
      InputProps:
        type === 'number' || type === 'currency'
          ? {
              inputComponent: NumericFormatCustom as any,
              startAdornment:
                type === 'currency' ? (
                  <InputAdornment position="start">$</InputAdornment>
                ) : null,
              inputProps: {
                itemType: type,
                thousandSeparator: thousandSeparator,
              },
            }
          : undefined,
    };
  }, [
    field,
    otherProps,
    label,
    name,
    textarea,
    multiline,
    rows,
    required,
    placeholder,
    type,
    thousandSeparator,
  ]);

  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = error ? error(meta.error) : meta.error;
  }

  const handleSetValue = useCallback(() => {
    if (entryInfo) {
      setFieldValue(name, entryInfo.value);
      if (rejectInputEntry) rejectInputEntry(name);
    }
  }, [entryInfo, name, setFieldValue, rejectInputEntry]);

  const handleRejectValue = useCallback(() => {
    if (rejectInputEntry) rejectInputEntry(name);
  }, [rejectInputEntry, name]);

  return (
    <StyledContainer>
      <StyledTextField {...configTextField} />
      <br />
      {entryInfo && rejectInputEntry && (
        <InputEntry
          info={entryInfo}
          setValue={handleSetValue}
          rejectValue={handleRejectValue}
        />
      )}
    </StyledContainer>
  );
};

export default TextFieldWrapper;
