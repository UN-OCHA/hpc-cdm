import { TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import tw from 'twin.macro';

const StyledTextField = tw(TextField)`
min-w-[10rem]
w-full
`;

const TextFieldWrapper = ({
  type,
  name,
  label,
  placeholder,
  ...otherProps
}: {
  type: 'text' | 'number';
  name: string;
  label: string;
  placeholder?: string;
}) => {
  const [field, meta] = useField(name);

  const configTextField: TextFieldProps = {
    ...field,
    ...otherProps,
    label: label,
    id: name,
    placeholder: placeholder,
    size: 'small',
    type: type,
    inputProps:
      type === 'number'
        ? {
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }
        : undefined,
  };
  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }
  return <StyledTextField {...configTextField} />;
};

export default TextFieldWrapper;
