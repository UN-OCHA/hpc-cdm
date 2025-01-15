import {
  Checkbox,
  FormControlLabel,
  type FormControlLabelProps,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import React from 'react';

const CheckBox = ({
  name,
  label,
  size = 'medium',
  value,
  onChange,
  disabled,
  isControlled,
  sx,
  dataTest,
}: {
  name: string;
  label?: string;
  value?: unknown;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | unknown;
  size?: 'small' | 'medium';
  disabled?: boolean;
  isControlled?: boolean;
  sx?: SxProps<Theme>;
  dataTest?: string;
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
    disabled,
    control: (
      <Checkbox
        onChange={(event) => handleChange(event)}
        size={size}
        {...(isControlled
          ? {
              defaultChecked:
                typeof field.value === 'boolean' ? field.value : false,
            }
          : { checked: !!field.value })}
      />
    ),
  };
  return <FormControlLabel sx={sx} data-test={dataTest} {...configCheckBox} />;
};

export default CheckBox;
