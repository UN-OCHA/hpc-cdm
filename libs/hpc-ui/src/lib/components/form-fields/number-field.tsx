import { StyledTextField } from './text-field';
import { NumericFormat } from 'react-number-format';
import InputAdornment from '@mui/material/InputAdornment';
import { useField, useFormikContext } from 'formik';

interface NumberFieldProps {
  type: 'number' | 'currency';
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowNegative?: boolean;
}
const NumberField = ({
  type,
  name,
  label,
  placeholder,
  allowNegative,
  required,
  ...otherProps
}: NumberFieldProps) => {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext<number>();

  return (
    <NumericFormat
      {...field}
      {...otherProps}
      name={name}
      label={label}
      onValueChange={(values) => {
        setFieldValue(field.name, values.value);
      }}
      thousandSeparator={type === 'currency'}
      valueIsNumericString
      size="small"
      decimalScale={type === 'number' ? 0 : undefined} //  0 means no decimals
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
