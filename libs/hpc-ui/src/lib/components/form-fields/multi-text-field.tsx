import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import tw from 'twin.macro';

const MultiText = tw(Autocomplete)`
    min-w-[10rem]
    w-full
    `;

const MultiTextField = React.memo(
  ({
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
    const setFieldValueWrapper = (name: string, values: string[]) => {
      setFieldValue(name, values);
      setInputValue('');
    };

    const configTextField = useCallback(
      (params: AutocompleteRenderInputParams): TextFieldProps => {
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
                ? errorMessage
                : meta.error
              : undefined,
        };
      },
      [label, placeholder, type, errorMessage, meta]
    );

    const multiTextProps = useMemo(
      (): AutocompleteProps<string[], boolean, undefined, boolean> => ({
        ...field,
        ...otherProps,
        multiple: true,
        freeSolo: true,
        options: [],
        renderInput: (params) => <TextField {...configTextField(params)} />,
        onBlur: (_) => {
          if (inputValue.trim() !== '') {
            setFieldValue(field.name, [...field.value, inputValue.trim()]);
          }
        },
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
      }),
      [field, otherProps, inputValue, configTextField, setFieldValue]
    );
    if (meta && meta.touched && meta.error) {
      console.error(errorMessage);
    }
    return <MultiText {...multiTextProps} />;
  }
);

export default MultiTextField;
