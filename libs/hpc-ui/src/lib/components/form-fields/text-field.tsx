import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { useField } from 'formik';
import tw from 'twin.macro';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import React from 'react';

const StyledTextField = tw(TextField)`
min-w-[10rem]
w-full
`;
interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
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
          let value = values.value;
          if (
            (itemType === 'number' || itemType === 'currency') &&
            value === ''
          ) {
            value = '0';
          }
          onChange({
            target: {
              name: props.name,
              value: value,
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
  ...otherProps
}: {
  type: 'text' | 'number' | 'currency';
  name: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  thousandSeparator?: boolean;
  rows?: number;
}) => {
  const [field, meta] = useField(name);
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
  return <StyledTextField {...configTextField} />;
};

export default TextFieldWrapper;
