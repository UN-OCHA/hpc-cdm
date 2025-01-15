import { Link, type TextFieldProps } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  DatePicker as BaseDatePicker,
  type DatePickerProps as DatePickerPropsMUI,
} from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useField } from 'formik';
import { useState } from 'react';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../i18n';
import dayjs from '../../i18n/utils/dayjs';
import { THEME } from '../../theme';
import { REQUIRED_BORDER_STYLE } from '../../util';

type Dayjs = dayjs.Dayjs;

export type DatePickerProps = {
  name: string;
  label: string;
  lang?: LanguageKey;
  enableButton?: boolean;
  /**
   *  **Warning:**
   *  This prop is used only if we are not using
   *  `Formik`. This is for controlled fields
   */
  controlledField?: {
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => unknown;
    error?: string;
  };
  disabled?: boolean;
  required?: boolean;
  dataTest?: {
    field?: string;
    today?: string;
  };
};

const StyledDatePicker = tw.div`
  w-full  
  flex
  flex-col
  items-start
`;

const DatePicker = ({
  name,
  label,
  lang = 'en',
  enableButton = true,
  controlledField,
  disabled,
  required,
  dataTest,
}: DatePickerProps) => {
  const [field, meta, { setValue, setTouched }] = useField<Dayjs | null>(name);
  const [isControlledTouched, setIsControlledTouched] = useState(false);
  const textFieldErrorProps: Partial<TextFieldProps> = {};
  if (
    (meta.error && meta.touched) ||
    (isControlledTouched && !!controlledField?.error)
  ) {
    textFieldErrorProps.error = true;
    textFieldErrorProps.helperText = meta.error ?? controlledField?.error;
  }

  const datePickerProps: DatePickerPropsMUI = {
    ...field,
    ...(controlledField ? { value: controlledField.value } : {}),
    enableAccessibleFieldDOMStructure: false,
    format: 'DD/MM/YYYY',
    timezone: 'UTC',
    disabled,
    onError: (error) => {
      console.error(error);
    },
    onChange: (date) => {
      setTouched(true);
      setIsControlledTouched(true);
      if (controlledField) {
        controlledField.onChange(date);
        return;
      }
      setValue(date);
    },
    label,
    slotProps: {
      textField: {
        sx: {
          ...tw`w-full min-w-[10rem]`,
          ...(required && !field.value && !controlledField?.value
            ? { ...REQUIRED_BORDER_STYLE }
            : {}),
        },
        disabled,
        required,
        InputLabelProps: { shrink: true },
        size: 'small',
        ...textFieldErrorProps,
      },
      field: {
        clearable: true,
      },
    },
    sx: tw`w-full`,
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
      <StyledDatePicker data-test={dataTest?.field}>
        <BaseDatePicker {...datePickerProps} />
        {enableButton && !disabled && (
          <Link
            component="button"
            type="button"
            variant="body2"
            color={THEME.colors.textLink}
            onClick={() => {
              const today = dayjs.utc().startOf('day');
              if (controlledField) {
                controlledField.onChange(today);
              } else {
                setValue(today);
              }
            }}
            data-test={dataTest?.today}
          >
            {t.t(lang, (s) => s.datePicker.today)}
          </Link>
        )}
      </StyledDatePicker>
    </LocalizationProvider>
  );
};

export default DatePicker;
