import InputAdornment from '@mui/material/InputAdornment';
import { useField } from 'formik';
import { useEffect, useState } from 'react';
import { type NumberFormatValues, NumericFormat } from 'react-number-format';
import { REQUIRED_BORDER_STYLE } from '../../util';
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

  useEffect(() => {
    const delay = 300;
    const debounceTimer = setTimeout(() => {
      setValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [inputValue, field.name, setValue]);

  return (
    <NumericFormat
      {...fieldWithNoOnChange}
      {...textFieldErrors}
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
      }}
    />
  );
};

export default NumberField;
