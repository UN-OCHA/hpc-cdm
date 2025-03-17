import InputAdornment from '@mui/material/InputAdornment';
import { useField } from 'formik';
import { useState } from 'react';
import { type NumberFormatValues, NumericFormat } from 'react-number-format';
import { REQUIRED_BORDER_STYLE } from '../../util';
import { StyledTextField } from './text-field';

export interface NumberFieldProps {
  name: string;
  label: string;
  type?: 'integer' | 'currency' | 'float' | 'unknownCurrency';
  placeholder?: string;
  required?: boolean;
  allowNegative?: boolean;
  disabled?: boolean;
}
const NumberField = ({
  name,
  label,
  type = 'integer',
  placeholder,
  allowNegative = false,
  required,
  disabled,
}: NumberFieldProps) => {
  const [field, meta, { setValue }] = useField<string>(name);
  const { onChange: _onChange, ...fieldWithNoOnChange } = field;

  const [inputValue, setInputValue] = useState(field.value);
  const textFieldErrors: { error?: boolean; helperText?: string } = {};

  if (meta && meta.touched && meta.error) {
    textFieldErrors.error = true;
    textFieldErrors.helperText = meta.error;
  }

  return (
    <NumericFormat
      {...fieldWithNoOnChange}
      {...textFieldErrors}
      onBlur={(e) => {
        fieldWithNoOnChange.onBlur(e);
        setValue(inputValue);
      }}
      sx={required && !field.value ? REQUIRED_BORDER_STYLE : undefined}
      name={name}
      label={label}
      onValueChange={(values: NumberFormatValues) => {
        setInputValue(values.value);
      }}
      thousandSeparator={type === 'currency' || type === 'unknownCurrency'}
      valueIsNumericString
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      size="small"
      decimalScale={type === 'float' ? 4 : 0} // 0 means no decimals
      allowNegative={allowNegative}
      customInput={StyledTextField}
      InputProps={{
        startAdornment:
          type === 'currency' ? (
            <InputAdornment position="start">$</InputAdornment>
          ) : undefined,
        size: 'small',
        label,
      }}
    />
  );
};

export default NumberField;
