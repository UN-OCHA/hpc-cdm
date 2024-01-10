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
import { FormObjectValue } from './types/types';

const StyledSelect = tw(Select)`
min-w-[10rem]
w-full
`;
const StyledIconButton = tw(IconButton)`
me-6
`;

interface SingleSelectProps {
  options: Array<FormObjectValue>;
  name: string;
  label: string;
  readonly?: boolean;
}

const SingleSelect = ({
  options,
  name,
  label,
  readonly,
  ...otherProps
}: SingleSelectProps) => {
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
    inputProps: { readOnly: readonly },
    renderValue: (value) => {
      return (value as unknown as FormObjectValue).displayLabel;
    },
    input: (
      <OutlinedInput
        endAdornment={
          field.value !== '' &&
          !readonly && (
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
          <MenuItem
            key={`${value.displayLabel}_${value.value}`}
            value={value as any}
          >
            {value.displayLabel}
          </MenuItem>
        ))}
      </StyledSelect>
    </FormControl>
  );
};
export default SingleSelect;
