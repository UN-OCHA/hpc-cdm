import {
  alpha,
  Autocomplete,
  Box,
  Divider,
  styled as muiStyled,
} from '@mui/material';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { forwardRef, useMemo, useState } from 'react';
import NumberFormat, { InputAttributes } from 'react-number-format';

const Fieldset = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  margin: 0,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  padding: 0,
  outline: `1px solid ${alpha('#000', 0.23)}`,
  outlineOffset: -1,
  border: 0,
  borderRadius: theme.shape.borderRadius,
  fieldset: {
    border: 'none',
  },
  legend: {
    visibility: 'visible',
    background: theme.palette.background.default,
  },
}));

type CurrencyFieldProps = TextFieldProps & {
  currencyOptions?: {
    id: number;
    code: string;
  }[];
};

export default function CurrencyField(props: CurrencyFieldProps) {
  const { currencyOptions, ...rest } = props;
  const [isFocused, setIsFocused] = useState(false);

  const CustomNumberFormat = useMemo(
    () =>
      forwardRef<
        NumberFormat<InputAttributes>,
        {
          onChange: (event: {
            target: { name: string; value: string };
          }) => void;
          name: string;
        }
      >((numberFormatProps, ref) => {
        const { onChange, ...rest } = numberFormatProps;
        return (
          <NumberFormat
            {...rest}
            getInputRef={ref}
            onValueChange={(values) => {
              onChange({
                target: {
                  name: numberFormatProps.name,
                  value: values.value,
                },
              });
            }}
            thousandSeparator
            isNumericString
            {...(!currencyOptions?.length && {
              prefix: '$',
            })}
          />
        );
      }),
    [currencyOptions]
  );

  const focusProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  const textFieldProps: TextFieldProps = {
    ...rest,
    ...focusProps,
    InputProps: {
      inputComponent: CustomNumberFormat as any,
    },
  };

  return currencyOptions?.length ? (
    <Fieldset
      component="fieldset"
      sx={
        isFocused
          ? {
              outlineColor: (theme) => theme.palette.primary.main,
              outlineWidth: 2,
              outlineOffset: -2,
            }
          : {
              '&:hover': {
                outlineColor: (theme) => theme.palette.text.primary,
              },
            }
      }
    >
      <TextField {...textFieldProps} margin="none" />
      <Divider flexItem variant="middle" orientation="vertical" />
      <Autocomplete
        {...focusProps}
        sx={{
          width: 130,
        }}
        options={currencyOptions}
        getOptionLabel={(option) => option.code}
        renderInput={(inputParams) => (
          <TextField {...inputParams} margin="none" />
        )}
        disableClearable
        autoHighlight
      />
    </Fieldset>
  ) : (
    <TextField {...textFieldProps} />
  );
}
