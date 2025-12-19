import { TextField, type TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { REQUIRED_BORDER_STYLE } from '../../util';

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
   *  **Warning:**
   *  This prop is used only if we are not using
   *  `Formik`. This is for controlled fields
   */
  controlledField?: {
    onChange: (...args: unknown[]) => unknown;
    value: string;
    error?: string;
  };
  disabled?: boolean;
  dataTest?: string;
}
const TextFieldWrapper = ({
  name,
  label,
  placeholder,
  textarea,
  minRows,
  required,
  controlledField,
  disabled,
  dataTest,
}: TextFieldWrapperProps) => {
  const [field, meta, { setValue }] = useField(name);
  const [isControlledTouched, setIsControlledTouched] = useState(false);
  const [fieldValue, setFieldValue] = useState(
    controlledField?.value ?? field.value
  );
  const configTextField: TextFieldProps = {
    ...field,
    value: fieldValue,
    sx: required && !fieldValue ? REQUIRED_BORDER_STYLE : undefined,
    label,
    id: name,
    disabled,
    multiline: textarea,
    minRows,
    maxRows: 5,
    required,
    placeholder,
    size: 'small',
    type: 'text',
    inputProps: {
      sx: textarea
        ? {
            ...tw`resize-y max-h-[500px]`,
          }
        : {},
    },
  };

  /*
   * Added if value is changed by another user action
   * i.e. Clear all form fields with a button click
   */
  useEffect(() => {
    if (!controlledField) {
      setFieldValue(field.value);
    } else {
      setFieldValue(controlledField.value);
    }
  }, [field.value, controlledField]);

  if (
    (meta.touched && meta.error) ||
    (isControlledTouched && !!controlledField?.error)
  ) {
    configTextField.error = true;
    configTextField.helperText = meta.error ?? controlledField?.error;
  }
  return (
    <StyledTextField
      {...configTextField}
      onChange={(e) => setFieldValue(e.target.value)}
      onBlur={(e) => {
        if (controlledField) {
          controlledField.onChange(fieldValue);
          setIsControlledTouched(true);
        } else {
          field.onBlur(e);
          setValue(fieldValue);
        }
      }}
      data-test={dataTest}
    />
  );
};

export default TextFieldWrapper;
