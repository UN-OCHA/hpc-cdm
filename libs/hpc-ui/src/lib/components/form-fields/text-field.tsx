import { TextField, type TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import tw from 'twin.macro';
import { REQUIRED_BORDER_STYLE } from '../../util';
import { useState } from 'react';

export const StyledTextField = tw(TextField)`
  min-w-[10rem]
  w-full
`;

export interface TextFieldWrapperProps {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  /**
   * If textarea is set to `true` you can specify
   *  the number of rows to initially display.
   */
  minRows?: number;
  required?: boolean;
  /**
   *  If `onChange()` is passed, it will replace Formik's
   *  `onChange()` prop
   */
  onChange?: (...args: unknown[]) => unknown;
  /**
   *  **Warning:**
   *  This prop is used only if we are not using
   *  `Formik`, if you are using `Formik`, you don't need
   *  to pass this prop. This is for controlled fields
   */
  initialValue?: string;
  /**
   *  **Warning:**
   *  This prop is used only if we are not using
   *  `Formik`, if you are using `Formik`, you don't need
   *  to pass this prop. This is for controlled fields
   */
  controlledError?: string;
  disabled?: boolean;
}
const TextFieldWrapper = ({
  name,
  label,
  placeholder,
  textarea,
  minRows,
  required,
  onChange,
  initialValue,
  controlledError,
  disabled,
}: TextFieldWrapperProps) => {
  const [field, meta] = useField(name);
  const [controlledTouched, setControlledTouched] = useState(false);
  const configTextField: TextFieldProps = {
    ...field,
    sx: required && !field.value ? REQUIRED_BORDER_STYLE : undefined,
    label,
    id: name,
    disabled,
    multiline: textarea,
    minRows,
    onBlur: () => setControlledTouched(true),
    maxRows: 5,
    required,
    placeholder,
    size: 'small',
    type: 'text',
  };
  if (
    (meta.touched && meta.error) ||
    (controlledTouched && !!controlledError)
  ) {
    configTextField.error = true;
    configTextField.helperText = meta.error ?? controlledError;
  }
  return (
    <StyledTextField
      {...configTextField}
      {...(onChange
        ? {
            onChange: (e) => {
              onChange(e.target.value);
            },
          }
        : {})}
      {...(initialValue !== undefined ? { value: initialValue } : {})}
    />
  );
};

export default TextFieldWrapper;
