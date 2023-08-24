import {
  Box,
  Chip,
  InputLabel,
  MenuItem,
  OutlinedInput,
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

const MultiSelect = ({
  options,
  name,
  label,
  placeholder,
  ...otherProps
}: {
  options: { value: string | number; name: string }[];
  name: string;
  label: string;
  placeholder?: string;
}) => {
  const { setFieldValue } = useFormikContext<string[]>();
  const [field, meta] = useField(name);
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    if (typeof value !== 'string') {
      const testValue = options.filter((a) => value.some((b) => a.value === b));
      if (testValue) {
        setFieldValue(
          name,
          testValue.map((a) => a.value)
        );
      }
    }
  };

  const multiSelectConfig: SelectProps<string[]> = {
    ...field,
    ...otherProps,
    multiple: true,
    labelId: `${label.toLowerCase().replace(' ', '-').trim()}-label`,
    placeholder: placeholder,
    size: 'small',
    onChange: handleChange,
    input: <OutlinedInput id="select-multiple-chip" label="Chip" />,
    renderValue: (selected) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((value) => (
          <Chip key={value} label={value} />
        ))}
      </Box>
    ),
  };

  return (
    <>
      <InputLabel id={`${label.toLowerCase().replace(' ', '-').trim()}-label`}>
        {label}
      </InputLabel>
      <StyledSelect {...multiSelectConfig}>
        {options.map((value) => (
          <MenuItem key={value.value} value={value.value}>
            {value.name}
          </MenuItem>
        ))}
      </StyledSelect>
    </>
  );
};

export default MultiSelect;
