import { Autocomplete, AutocompleteProps } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { useState } from 'react';
import tw from 'twin.macro';
import { StyledTextField } from './text-field';

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
  const [field] = useField(name);
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
    onInputChange: (_, newInputValue) => handleInputChange(newInputValue),
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
