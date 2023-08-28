import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';

const StyledTextField = tw(TextField)`
      min-w-[10rem]
      w-full`;
const StyledAutocomplete = tw(Autocomplete)`
      min-w-[10rem]
      w-full`;

const AutocompleteSelect = ({
  name,
  label,
  options,
  placeholder,
  isMulti,
  ...otherProps
}: {
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
  isMulti?: boolean;
}) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const configAutocomplete: AutocompleteProps<
    string,
    boolean,
    boolean,
    boolean
  > = {
    ...field,
    ...otherProps,
    multiple: isMulti,
    options: options,
    getOptionLabel: (op) => op,
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
        placeholder={placeholder}
        InputProps={{
          ...params.InputProps,
        }}
      />
    ),
  };

  return <StyledAutocomplete {...configAutocomplete} />;
};

export default AutocompleteSelect;
