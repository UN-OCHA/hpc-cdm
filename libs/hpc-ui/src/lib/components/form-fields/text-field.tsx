import { TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import tw from 'twin.macro';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import React from 'react';

const StyledTextField = tw(TextField)`
min-w-[10rem]
w-full
`;
interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  itemType: 'number' | 'currency';
}
export const NumericFormatCustom = React.forwardRef<
  NumericFormatProps,
  CustomProps
>(function NumericFormatCustom(props, ref) {
  const { onChange, name, itemType, ...others } = props;
  return (
    <NumericFormat
      {...others}
      name={name}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator={itemType === 'currency'}
      valueIsNumericString
      prefix={itemType === 'currency' ? '$ ' : ''}
    />
  );
});

interface TextFieldWrapperProps {
  type: 'text' | 'number' | 'currency';
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
}
const TextFieldWrapper = ({
  type,
  name,
  label,
  placeholder,
  textarea,
  ...otherProps
}: TextFieldWrapperProps) => {
  const [field, meta] = useField(name);

  const configTextField: TextFieldProps = {
    ...field,
    ...otherProps,
    label: label,
    id: name,
    multiline: textarea,
    placeholder: placeholder,
    size: 'small',
    type: 'text',
    InputProps:
      type === 'number' || type === 'currency'
        ? {
            inputComponent: NumericFormatCustom as any,
          }
        : undefined,
    inputProps: { itemType: type },
  };
  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }
  return <StyledTextField {...configTextField} />;
};

export default TextFieldWrapper;
