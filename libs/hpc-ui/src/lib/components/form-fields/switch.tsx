import React, { useMemo } from 'react';
import {
  FormControlLabel,
  FormControlLabelProps,
  Switch as SwitchMUI,
} from '@mui/material';
import { useField } from 'formik';

type SwitchSize = 'small' | 'medium';
type SwitchColor = 'primary' | 'error' | 'success';

const Switch = React.memo(
  ({
    name,
    label,
    size = 'medium',
    color,
    ...otherProps
  }: {
    name: string;
    label?: string;
    color?: SwitchColor;
    size?: SwitchSize;
  }) => {
    const [field] = useField(name);

    const control = useMemo(
      () => <SwitchMUI checked={field.value} size={size} color={color} />,
      [field.value, size, color]
    );

    const configCheckBox: FormControlLabelProps = useMemo(
      () => ({
        ...field,
        ...otherProps,
        label: label,
        id: name,
        control: control,
      }),
      [field, otherProps, label, name, control]
    );

    return <FormControlLabel {...configCheckBox} />;
  }
);

export default Switch;
