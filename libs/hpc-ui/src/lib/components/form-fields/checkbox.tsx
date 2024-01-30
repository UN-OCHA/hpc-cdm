import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import React from 'react';

const CheckBox = ({
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
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && value) {
      const values = onChange(event);
      setFieldValue(name, values);
    } else {
      setFieldValue(name, !field.value);
    }
  };
  const configCheckBox: FormControlLabelProps = {
    ...field,
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
