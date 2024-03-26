import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { useState } from 'react';
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
  preOptions,
  placeholder,
  isMulti,
  ...otherProps
}: {
  name: string;
  label: string;
  options: string[];
  preOptions?: string[];
  placeholder?: string;
  isMulti?: boolean;
}) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);
  const [selectOptions, setSelectOptions] = useState(
    preOptions ? preOptions : []
  );
  const handleInputChange = (newInputValue: string) =>
    newInputValue.length === 0 && preOptions
      ? setSelectOptions(preOptions)
      : setSelectOptions(options);

  const configAutocomplete: AutocompleteProps<
    string,
    boolean,
    boolean,
    boolean
  > = {
    ...field,
    ...otherProps,
    multiple: isMulti,
    options: selectOptions,
    getOptionLabel: (op) => op,
    ChipProps: { size: 'small' },
    onInputChange: (event, newInputValue) => handleInputChange(newInputValue),
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
