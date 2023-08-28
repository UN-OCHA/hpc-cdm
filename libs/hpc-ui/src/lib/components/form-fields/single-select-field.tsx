import {
  MenuItem,
  Select,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';

const StyledSelect = tw(Select)`
min-w-[10rem]
w-full
`;

const SingleSelect = ({
  options,
  name,
  label,
  ...otherProps
}: {
  options: { value: string; name: string }[];
  name: string;
  label: string;
}) => {
  const { setFieldValue } = useFormikContext<string>();
  const [field, meta] = useField(name);

  const handleChange = (event: SelectChangeEvent) => {
    const {
      target: { value },
    } = event;
    setFieldValue(name, value);
  };
  const singleSelectConfig: SelectProps<string> = {
    ...field,
    ...otherProps,
    label: label,
    onChange: handleChange,
    size: 'small',
  };
  if (meta && meta.touched && meta.error) {
    singleSelectConfig.error = true;
  }
  return (
    <StyledSelect {...singleSelectConfig}>
      {options.map((value) => (
        <MenuItem key={value.value} value={value.value}>
          {value.name}
        </MenuItem>
      ))}
    </StyledSelect>
  );
};
export default SingleSelect;
