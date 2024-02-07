import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import InputEntry from './input-entry';
import { forms } from '@unocha/hpc-data';

const StyledContainer = tw.div`
w-full
`;

const StyledTextField = tw(TextField)`
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
const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, name, itemType, thousandSeparator, ...others } = props;
    return (
      <NumericFormat
        {...others}
        name={name}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: +values.value,
            },
          });
        }}
        thousandSeparator={thousandSeparator}
        valueIsNumericString
      />
    );
  }
);

const TextFieldWrapper = ({
  type,
  name,
  label,
  placeholder,
  multiline,
  rows,
  thousandSeparator,
  entryInfo,
  rejectInputEntry,
  ...otherProps
}: {
  type: 'text' | 'number' | 'currency';
  name: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  thousandSeparator?: boolean;
  rows?: number;
  entryInfo?: forms.InputEntryType | null;
  rejectInputEntry?: (key: string) => void;
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext<string>();
  const configTextField: TextFieldProps = {
    ...field,
    ...otherProps,
    label: label,
    id: name,
    placeholder: placeholder,
    multiline: multiline,
    rows: rows,
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
  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }
  return (
    <StyledContainer>
      <StyledTextField {...configTextField} />
      <br />
      {entryInfo && rejectInputEntry && (
        <InputEntry
          info={entryInfo}
          setValue={() => {
            setFieldValue(name, entryInfo.value);
            rejectInputEntry(name);
          }}
          rejectValue={() => {
            rejectInputEntry(name);
          }}
        />
      )}
    </StyledContainer>
  );
};

export default TextFieldWrapper;
