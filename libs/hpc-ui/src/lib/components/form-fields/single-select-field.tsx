import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';

const StyledSelect = tw(Select)`
min-w-[10rem]
w-full
`;
const StyledIconButton = tw(IconButton)`
  me-6`;
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
    labelId: `${label.toLowerCase().replace(' ', '-').trim()}-label`,
    label: label,
    input: (
      <OutlinedInput
        endAdornment={
          field.value !== '' && (
            <StyledIconButton
              onClick={() => setFieldValue(name, '')}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </StyledIconButton>
          )
        }
        id="select-single"
        label={label}
      />
    ),
    onChange: handleChange,
    size: 'small',
  };
  if (meta && meta.touched && meta.error) {
    singleSelectConfig.error = true;
  }
  return (
    <FormControl sx={{ width: '100%' }} size="small">
      <InputLabel id={`${label.toLowerCase().replace(' ', '-').trim()}-label`}>
        {label}
      </InputLabel>
      <StyledSelect {...singleSelectConfig}>
        {options.map((value) => (
          <MenuItem key={value.value} value={value.value}>
            {value.name}
          </MenuItem>
        ))}
      </StyledSelect>
    </FormControl>
  );
};
export default SingleSelect;
