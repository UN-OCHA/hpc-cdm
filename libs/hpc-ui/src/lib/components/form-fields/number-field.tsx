import InputAdornment from '@mui/material/InputAdornment';
import { useField, useFormikContext } from 'formik';
import { type NumberFormatValues, NumericFormat } from 'react-number-format';
import { StyledTextField } from './text-field';

export interface NumberFieldProps {
  type: 'number' | 'currency' | 'float' | 'unknownCurrency';
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowNegative?: boolean;
  disabled?: boolean;
}
const NumberField = ({
  type,
  name,
  label,
  placeholder,
  allowNegative,
  required,
  disabled,
}: NumberFieldProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext<number>();

  const textFieldErrors: { error?: boolean; helperText?: string } = {};

  if (meta && meta.touched && meta.error) {
    textFieldErrors.error = true;
    textFieldErrors.helperText = meta.error;
  }
  return (
    <NumericFormat
      {...field}
      {...textFieldErrors}
      name={name}
      label={label}
      onValueChange={(values: NumberFormatValues) => {
        setFieldValue(field.name, values.value);
      }}
      thousandSeparator={type === 'currency' || type === 'unknownCurrency'}
      valueIsNumericString
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      size="small"
      decimalScale={type === 'number' ? 0 : 4} // 0 means no decimals
      allowNegative={allowNegative}
      customInput={StyledTextField}
      InputProps={{
        startAdornment:
          type === 'currency' ? (
            <InputAdornment position="start">$</InputAdornment>
          ) : undefined,
        size: 'small',
        label,
        ...textFieldErrors,
      }}
    />
  );
};

NumberField.defaultProps = {
  allowNegative: false,
};
export default NumberField;
