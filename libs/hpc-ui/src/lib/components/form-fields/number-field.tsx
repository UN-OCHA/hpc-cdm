import React, { useMemo, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import InputAdornment from '@mui/material/InputAdornment';
import { useField, useFormikContext } from 'formik';
import { StyledTextField } from './text-field';
import { NumberFormatValues } from 'react-number-format';
import { InputProps } from '@mui/material';

interface NumberFieldProps {
  type: 'number' | 'currency';
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowNegative?: boolean;
}

const NumberField = React.memo(
  ({
    type,
    name,
    label,
    placeholder,
    allowNegative = false,
    required,
    ...otherProps
  }: NumberFieldProps) => {
    const [field] = useField(name);
    const { setFieldValue } = useFormikContext<number>();

    const handleValueChange = useCallback(
      (values: NumberFormatValues) => {
        setFieldValue(field.name, values.value);
      },
      [field.name, setFieldValue]
    );

    const decimalScale = useMemo(
      () => (type === 'number' ? 0 : undefined),
      [type]
    );

    const startAdornment = useMemo(() => {
      return type === 'currency' ? (
        <InputAdornment position="start">$</InputAdornment>
      ) : undefined;
    }, [type]);

    const inputProps: Partial<InputProps> = useMemo(
      () => ({
        startAdornment,
        size: 'small', // or 'medium', depending on your preference
        label,
      }),
      [startAdornment, label]
    );
    return (
      <NumericFormat
        {...field}
        {...otherProps}
        name={name}
        label={label}
        onValueChange={handleValueChange}
        thousandSeparator={type === 'currency'}
        valueIsNumericString
        size="small"
        decimalScale={decimalScale}
        allowNegative={allowNegative}
        customInput={StyledTextField}
        InputProps={inputProps}
      />
    );
  }
);

export default NumberField;
