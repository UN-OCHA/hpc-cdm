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
}
const TextFieldWrapper = ({
  name,
  label,
  placeholder,
  textarea,
  minRows,
  error,
  required,
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
  return <StyledTextField {...configTextField} />;
};

export default TextFieldWrapper;
