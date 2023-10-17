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
  ...otherProps
}: {
  name: string;
  label?: string;
  value?: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | any;
  size?: 'small' | 'medium';
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const values = onChange(event);
      setFieldValue(name, [...values, value]);
    } else {
      setFieldValue(name, !field.value);
    }
  };
  const configCheckBox: FormControlLabelProps = {
    ...field,
    ...otherProps,
    label: label,
    id: name,
    control: <Checkbox onChange={(event) => handleChange(event)} size={size} />,
  };
  return <FormControlLabel {...configCheckBox} />;
};

CheckBox.defaultProps = {
  size: 'medium',
};
export default CheckBox;
