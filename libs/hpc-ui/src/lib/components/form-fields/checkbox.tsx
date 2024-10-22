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
}: {
  name: string;
  label?: string;
  value?: unknown;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | unknown;
  size?: 'small' | 'medium';
}) => {
  const [field] = useField(name);
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
    label,
    id: name,
    control: (
      <Checkbox
        onChange={(event) => handleChange(event)}
        size={size}
        defaultChecked={typeof field.value === 'boolean' ? field.value : false}
      />
    ),
  };
  return <FormControlLabel {...configCheckBox} />;
};

CheckBox.defaultProps = {
  size: 'medium',
};
export default CheckBox;
