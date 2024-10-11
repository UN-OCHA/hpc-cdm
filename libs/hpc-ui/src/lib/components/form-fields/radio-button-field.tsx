import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { FormObjectValue } from '@unocha/hpc-data';
import { useFormikContext } from 'formik';

export type RadioButtonFieldProps = {
  name: string;
  label: string;
  options: FormObjectValue[];
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const RadioButtonField = ({
  name,
  label,
  options,
  value,
  onChange,
  disabled,
}: RadioButtonFieldProps) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    if (onChange) {
      onChange(value);
    } else {
      setFieldValue(name, value);
    }
  };
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <RadioGroup name={name} value={value} onChange={handleChange} row>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.displayLabel}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioButtonField;
