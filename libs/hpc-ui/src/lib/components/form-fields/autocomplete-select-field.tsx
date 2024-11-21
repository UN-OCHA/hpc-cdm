import { Autocomplete, type AutocompleteProps } from '@mui/material';
import { type util } from '@unocha/hpc-data';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';
import { REQUIRED_BORDER_STYLE } from '../../util';
import { StyledTextField } from './text-field';

export type AutocompleteSelectProps = {
  name: string;
  label: string;
  options: util.FormObjectValue[];
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
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
  required,
}: AutocompleteSelectProps) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField<util.FormObjectValue>(name);

  const configAutocomplete: AutocompleteProps<
    util.FormObjectValue,
    boolean,
    boolean,
    boolean
  > = {
    ...field,
    disabled,
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
        sx={required && !field.value ? REQUIRED_BORDER_STYLE : undefined}
        size="small"
        label={label}
        disabled={disabled}
        required={required}
        InputProps={{
          ...params.InputProps,
        }}
      />
    ),
  };

  return <StyledAutocomplete {...configAutocomplete} />;
};

export default AutocompleteSelect;
