import React from 'react';
import { Autocomplete, AutocompleteProps } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';
import { StyledTextField } from './text-field';
import { FormObjectValue } from '@unocha/hpc-data';

const StyledAutocomplete = tw(Autocomplete)`
      min-w-[10rem]
      w-full`;

const AutocompleteSelect = React.memo(
  ({
    name,
    label,
    options,
    placeholder,
    readOnly,
    isMulti,
    ...otherProps
  }: {
    name: string;
    label: string;
    options: Array<FormObjectValue>;
    placeholder?: string;
    readOnly?: boolean;
    isMulti?: boolean;
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
      ...otherProps,
      multiple: isMulti,
      readOnly,
      options: options,
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
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
          }}
        />
      ),
    };

    return <StyledAutocomplete {...configAutocomplete} />;
  }
);

export default AutocompleteSelect;
