import { Autocomplete, type AutocompleteProps } from '@mui/material';
import { type FormObjectValue } from '@unocha/hpc-data';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';
import { StyledTextField } from './text-field';

const StyledAutocomplete = tw(Autocomplete)`
  min-w-[10rem]
  w-full
`;

const AutocompleteSelect = ({
  name,
  label,
  options,
  readOnly,
}: {
  name: string;
  label: string;
  options: FormObjectValue[];
  readOnly?: boolean;
}) => {
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
    getOptionLabel: (op) => (typeof op === 'string' ? op : op.displayLabel),
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
        InputProps={{
          ...params.InputProps,
        }}
      />
    ),
  };

  return <StyledAutocomplete {...configAutocomplete} />;
};

export default AutocompleteSelect;
