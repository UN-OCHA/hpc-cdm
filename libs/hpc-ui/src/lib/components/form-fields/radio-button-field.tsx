import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { type util } from '@unocha/hpc-data';
import { useField } from 'formik';

export type RadioButtonFieldProps<T extends string> = {
  name: string;
  label: string;
  options: util.FormObjectValue[];
  /**
   *  **Warning:**
   *  This prop is used only if we are not using
   *  `Formik`. This is for controlled fields
   */
  controlledField?: {
    value: T;
    onChange: (value: T) => void;
  };
  disabled?: boolean;
  dataTest?: string;
};

const RadioButtonField = <T extends string>({
  name,
  label,
  options,
  controlledField,
  disabled,
  dataTest,
}: RadioButtonFieldProps<T>) => {
  const [field, , { setValue }] = useField(name);

  const handleChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    if (controlledField) {
      controlledField.onChange(value as T);
    } else {
      setValue(value);
    }
  };
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <RadioGroup
        name={name}
        value={controlledField ? controlledField.value : field.value}
        onChange={handleChange}
        data-test={dataTest}
        row
      >
        {options.map(({ value, displayLabel }) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio />}
            label={displayLabel}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioButtonField;
