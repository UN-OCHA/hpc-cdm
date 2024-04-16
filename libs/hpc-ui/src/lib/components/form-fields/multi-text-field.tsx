import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';

const MultiText = tw(Autocomplete)`
    min-w-[10rem]
    w-full
    `;

const MultiTextField = ({
  name,
  label,
  placeholder,
  type,
  errorMessage,
  ...otherProps
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'currency';
  errorMessage?: string;
}) => {
  const { setFieldValue } = useFormikContext<string[]>();
  const [field, meta] = useField<string[]>(name);
  const [inputValue, setInputValue] = useState('');
  useEffect(() => setInputValue(''), [field.value]);

  const configTextField = (
    params: AutocompleteRenderInputParams
  ): TextFieldProps => {
    return {
      ...params,
      label: label,
      placeholder: placeholder,
      size: 'small',
      type: 'text',
      InputProps:
        type === 'currency'
          ? {
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start" sx={tw`ms-2`}>
                    $
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }
          : { ...params.InputProps },
      error: meta && meta.touched && meta.error ? true : false,
      helperText:
        meta && meta.touched && meta.error
          ? errorMessage
            ? meta.error.replace('{validationError}', errorMessage)
            : meta.error
          : undefined,
    };
  };

  const multiTextProps: AutocompleteProps<
    string[],
    boolean,
    undefined,
    boolean
  > = {
    ...field,
    ...otherProps,
    multiple: true,
    freeSolo: true,
    options: [],
    renderInput: (params) => <TextField {...configTextField(params)} />,
    onInputChange: (_, newInputValue) => {
      const options = newInputValue.split(',');

      if (options.length > 1) {
        setFieldValue(
          field.name,
          field.value
            .concat(options)
            .map((x) => x.trim())
            .filter((x) => x)
        );
      } else {
        setInputValue(newInputValue);
      }
    },
    onChange: (_, newValue) => {
      setFieldValue(field.name, newValue);
    },
    ChipProps: { size: 'small' },
    inputValue: inputValue,
  };
  if (meta && meta.touched && meta.error) {
    console.error(meta.error);
  }
  return <MultiText {...multiTextProps} />;
};

export default MultiTextField;
