import {
  RadioGroup as BaseRadioGroup,
  RadioGroupProps,
  FormControlLabel,
  Radio,
  InputLabel,
  FormControl,
} from '@mui/material';
import tw from 'twin.macro';
import { useField } from 'formik';

const StyledRadioGroup = tw(BaseRadioGroup)`
space-x-4
border
border-solid
border-[#ededee]
inline-block
p-3
`;
const RadioGroup = ({
  options,
  name,
  label,
  row,
  ...otherProps
}: {
  options: { value: string; label: string }[];
  name: string;
  label: string;
  row?: boolean;
}) => {
  const [field] = useField(name);

  const radioGroupConfig: RadioGroupProps = {
    ...field,
    ...otherProps,
  };
  return (
    <div>
      <FormControl component="fieldset">
        <InputLabel
          id={`${label.toLowerCase().replace(' ', '-').trim()}-label`}
          shrink
        >
          {label}
        </InputLabel>
        <StyledRadioGroup {...radioGroupConfig}>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </StyledRadioGroup>
      </FormControl>
    </div>
  );
};

export default RadioGroup;
