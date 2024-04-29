import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
  CheckboxProps,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import React from 'react';

const FormikCheckBox = ({
  name,
  label,
  size,
  value,
  onChange,
  disabled,
  ...otherProps
}: {
  name: string;
  label?: string | React.ReactNode;
  value?: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | any;
  size?: 'small' | 'medium';
  disabled?: boolean;
  [key: string]: any;
}) => {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const values = onChange(event);
      setFieldValue(name, values);
    } else {
      setFieldValue(name, !field.value);
    }
  };

  const configCheckBox: CheckboxProps = {
    ...field,
    ...otherProps,
    checked:
      field.value === true
        ? true
        : field.value &&
          typeof field.value === 'object' &&
          field.value.some((item: any) => item.id === value.id),
    onChange: handleChange,
    disabled: disabled || false,
  };
  return (
    <FormControlLabel
      control={<Checkbox {...configCheckBox} />}
      label={label}
    />
  );
};

FormikCheckBox.defaultProps = {
  size: 'medium',
};

const CheckBox = ({
  name,
  label,
  size,
  value,
  onChange,
  disabled,
  withoutFormik = false,
  ...otherProps
}: {
  name: string;
  label?: string | React.ReactNode;
  value?: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | any;
  size?: 'small' | 'medium';
  disabled?: boolean;
  withoutFormik?: boolean;
  [key: string]: any;
}) => {
  if (!withoutFormik) {
    return (
      <FormikCheckBox
        name={name}
        label={label}
        size={size}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...otherProps}
      />
    );
  }
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const values = onChange(event);
    }
  };
  const configCheckBox: FormControlLabelProps = {
    ...otherProps,
    label: label,
    id: name,
    control: (
      <Checkbox
        onChange={(event) => handleChange(event)}
        size={size}
        disabled={disabled}
      />
    ),
  };
  return <FormControlLabel {...configCheckBox} />;
};

CheckBox.defaultProps = {
  size: 'medium',
};
export default CheckBox;
