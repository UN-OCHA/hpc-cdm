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
  onChange?: (
    newValue: util.FormObjectValue | util.FormObjectValue[] | null
  ) => void;
  dataTest?: string;
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
  onChange,
  dataTest,
}: AutocompleteSelectProps) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta, { setTouched: setIsTouched }] =
    useField<util.FormObjectValue[]>(name);

  const configAutocomplete: AutocompleteProps<
    util.FormObjectValue,
    boolean,
    boolean,
    false
  > = {
    ...field,
    disabled,
    readOnly,
    options,
    onBlur: () => {
      setIsTouched(true);
    },
    isOptionEqualToValue: (option, value) => option.value === value.value,
    getOptionLabel: (op) =>
      typeof op === 'string' ? op : (op.displayLabel ?? ''),
    ChipProps: { size: 'small' },
    onChange: (_, newValue) => {
      if (onChange) {
        onChange(newValue);
      } else {
        // For multiple selections, newValue will be an array of selected values
        setFieldValue(name, newValue);
      }
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
        error={meta.touched && !!meta.error}
        helperText={meta.touched && meta.error ? meta.error : undefined}
      />
    ),
  };

  return <StyledAutocomplete {...configAutocomplete} data-test={dataTest} />;
};

export default AutocompleteSelect;
