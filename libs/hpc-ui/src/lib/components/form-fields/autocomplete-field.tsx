import { Autocomplete, AutocompleteProps } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';
import { StyledTextField } from './text-field';
import { FormObjectValue } from '@unocha/hpc-data';

export type AutocompleteSelectProps = {
  name: string;
  label: string;
  options: Array<FormObjectValue>;
  readOnly?: boolean;
  disabled?: boolean;
};
const StyledAutocomplete = tw(Autocomplete)`
  min-w-[10rem]
  w-full
`;

const AutocompleteSelect = ({
  name,
  label,
  options,
  readOnly,
  disabled,
}: AutocompleteSelectProps) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField<FormObjectValue>(name);

  const configAutocomplete: AutocompleteProps<
    FormObjectValue,
    boolean,
    boolean,
    boolean
  > = {
    ...field,
    readOnly,
    options,
    isOptionEqualToValue: (option, value) => option.value === value.value,
    getOptionLabel: (op) =>
      typeof op === 'string' ? op : op.displayLabel ?? '',
    ChipProps: { size: 'small' },
    onChange: (_, newValue) => {
      // For multiple selections, newValue will be an array of selected values
      setFieldValue(name, newValue);
    },

    renderInput: (params) => (
      <StyledTextField
        {...params}
        size="small"
        label={label}
        disabled={disabled}
        InputProps={{
          ...params.InputProps,
        }}
      />
    ),
  };

  return <StyledAutocomplete {...configAutocomplete} />;
};

export default AutocompleteSelect;
