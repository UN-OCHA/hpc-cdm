import {
  FormControlLabel,
  FormControlLabelProps,
  Switch as SwitchMUI,
} from '@mui/material';
import { useField } from 'formik';
import React from 'react';

const Switch = ({
  name,
  label,
  size,
  ...otherProps
}: {
  name: string;
  label?: string;
  size?: 'small' | 'medium';
}) => {
  const [field] = useField(name);

  const configCheckBox: FormControlLabelProps = {
    ...field,
    ...otherProps,
    label: label,
    id: name,
    control: <SwitchMUI size={size} defaultChecked={field.value} />,
  };
  return <FormControlLabel {...configCheckBox} />;
};

Switch.defaultProps = {
  size: 'medium',
};
export default Switch;
