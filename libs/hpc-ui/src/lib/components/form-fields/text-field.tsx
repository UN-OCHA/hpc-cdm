import { TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import tw from 'twin.macro';

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
  error?: (metaError: string) => string | undefined;
  required?: boolean;
  /**
   *  If `onChange()` is passed, it will replace Formik's
   *  `onChange()` prop
   */
  onChange?: (...args: any[]) => unknown;
  /** This prop is used only if we are not using
   *  `Formik`, if you are using `Formik`, you don't need
   *  to pass this prop.
   */
  initialValue?: string;
}
const TextFieldWrapper = ({
  name,
  label,
  placeholder,
  textarea,
  minRows,
  error,
  required,
  onChange,
  initialValue,
}: TextFieldWrapperProps) => {
  const [field, meta] = useField(name);
  const configTextField: TextFieldProps = {
    ...field,
    label,
    id: name,
    multiline: textarea,
    minRows,
    maxRows: 5,
    required,
    placeholder,
    size: 'small',
    type: 'text',
  };
  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = error ? error(meta.error) : meta.error;
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
