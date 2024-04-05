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
  required?: boolean;
}
const TextFieldWrapper = ({
  name,
  label,
  placeholder,
  textarea,
  required,
  ...otherProps
}: TextFieldWrapperProps) => {
  const [field, meta] = useField(name);
  const configTextField: TextFieldProps = {
    ...field,
    ...otherProps,
    label: label,
    id: name,
    multiline: textarea,
    maxRows: 5,
    required,
    placeholder: placeholder,
    size: 'small',
    type: 'text',
  };
  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }
  return <StyledTextField {...configTextField} />;
};

export default TextFieldWrapper;
