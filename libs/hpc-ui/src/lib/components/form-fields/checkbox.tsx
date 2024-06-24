import { Checkbox, FormControlLabel } from '@mui/material';
import { Field, useField, useFormikContext } from 'formik';
import React, { useMemo, memo, useEffect } from 'react';

const FormikCheckBox = memo(
  ({
    name,
    label,
    size,
    value,
    onChange,
    disabled,
    ...otherProps
  }: {
    name: string;
    value?: any;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | any;
    label?: string | React.ReactNode;
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

    useEffect(() => {
      setFieldValue(name, true);
    }, []);

    const configCheckBox = useMemo(() => {
      return {
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
    }, [field, otherProps, handleChange, value, disabled]);
    return (
      <FormControlLabel
        control={<Checkbox {...configCheckBox} />}
        label={label}
      />
    );
  }
);

const CheckBox = memo(
  ({
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
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event);
      }
    };
    const configCheckBox = useMemo(
      () => ({
        ...otherProps,
        label: label,
        id: name,
        control: (
          <Checkbox onChange={handleChange} size={size} disabled={disabled} />
        ),
      }),
      [label, name, size, disabled, otherProps]
    );
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

    return <FormControlLabel {...configCheckBox} />;
  }
);

export default CheckBox;
