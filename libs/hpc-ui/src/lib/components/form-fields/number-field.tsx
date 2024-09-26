import InputAdornment from '@mui/material/InputAdornment';
import { useField, useFormikContext } from 'formik';
import { NumericFormat } from 'react-number-format';
import { StyledTextField } from './text-field';

export interface NumberFieldProps {
  type: 'number' | 'currency' | 'float' | 'unknownCurrency';
  name: string;
  label: string;
  allowNegative?: boolean;
}
const NumberField = ({
  type,
  name,
  label,
  allowNegative,
}: NumberFieldProps) => {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext<number>();

  return (
    <NumericFormat
      {...field}
      name={name}
      label={label}
      onValueChange={(values) => {
        setFieldValue(field.name, values.value);
      }}
      thousandSeparator={type === 'currency' || type === 'unknownCurrency'}
      valueIsNumericString
      placeholder={placeholder}
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

NumberField.defaultProps = {
  allowNegative: false,
};
export default NumberField;
