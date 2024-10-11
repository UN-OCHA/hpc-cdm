import { useField, useFormikContext } from 'formik';
import { TextField, Link } from '@mui/material';
import {
  DatePicker as BaseDatePicker,
  DatePickerProps as DatePickerPropsMUI,
} from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import tw from 'twin.macro';
import dayjs from '../../i18n/utils/dayjs';
import { Dayjs } from 'dayjs';

export type DatePickerProps = {
  name: string;
  label: string;
  lang?: string;
  enableButton?: boolean;
  /** This prop is used only if we are not using
   *  `Formik`, if you are using `Formik`, you don't need
   *  to pass this prop.
   */
  initialValue?: Dayjs | null;
  onChange?: (value: Dayjs | null) => unknown;
  disabled?: boolean;
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
  initialValue,
  onChange,
  disabled,
}: DatePickerProps) => {
  const [field, , helpers] = useField(name);
  const { setFieldValue } = useFormikContext();

  const datePickerProps: DatePickerPropsMUI<Dayjs> = {
    ...field,
    ...(initialValue !== undefined ? { value: initialValue } : {}),
    format: 'DD/MM/YYYY',
    disabled,
    onError: (error) => {
      console.error(error);
    },
    ...(onChange
      ? { onChange: (date) => onChange(date) }
      : {
          onChange: (date) => {
            if (date === null) {
              setFieldValue(name, null);
            } else {
              setFieldValue(name, dayjs(date));
            }
          },
        }),
    label,
    slots: {
      textField: (params) => (
        <TextField
          {...params}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      ),
    },
    slotProps: {
      field: {
        clearable: true,
      },
    },
    sx: tw`w-full`,
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
      <StyledDatePicker>
        <BaseDatePicker {...datePickerProps} />
        {enableButton && !disabled && (
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => {
              if (onChange) {
                onChange(dayjs());
              } else {
                helpers.setValue(dayjs());
              }
            }}
          >
            Today
          </Link>
        )}
      </StyledDatePicker>
    </LocalizationProvider>
  );
};

export default DatePicker;
