import { TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import tw from 'twin.macro';

export const StyledTextField = tw(TextField)`
  min-w-[10rem]
  w-full
`;

interface TextFieldWrapperProps {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  error?: (metaError: string) => string | undefined;
  required?: boolean;
}
const TextFieldWrapper = ({
  name,
  label,
  placeholder,
  textarea,
  error,
  required,
}: TextFieldWrapperProps) => {
  const [field, meta] = useField(name);
  const configTextField: TextFieldProps = {
    ...field,
    label,
    id: name,
    multiline: textarea,
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
