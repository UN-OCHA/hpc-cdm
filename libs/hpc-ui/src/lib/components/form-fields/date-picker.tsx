import { useEffect, useState, useCallback, useMemo } from 'react';
import { useField } from 'formik';
import { TextField, Link } from '@mui/material';
import { DatePicker as BaseDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import tw from 'twin.macro';
import dayjs, { Dayjs } from 'dayjs';

const StyledDatePicker = tw.div`
  flex
  w-full
  items-baseline
`;

const StyledLink = tw(Link)`
  ms-8
`;

interface DatePickerProps {
  name: string;
  label: string;
  lang?: string;
  enableButton?: boolean;
  [key: string]: any; // Additional props
}

const DatePicker = ({
  name,
  label,
  lang = 'en',
  enableButton = true,
  ...otherProps
}: DatePickerProps) => {
  const [field, meta, helpers] = useField(name);
  const [cleared, setCleared] = useState(false);

  const onBlur = useCallback(() => {
    helpers.setTouched(true);
  }, [helpers]);

  const errorMsg = useMemo(() => {
    return meta.touched && Boolean(meta.error) ? (meta.error as string) : null;
  }, [meta.touched, meta.error]);

  useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        helpers.setValue(null);
        setCleared(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [cleared, helpers]);

  const handleDateChange = useCallback(
    (date: Dayjs | null) => {
      if (date?.isValid()) {
        helpers.setValue(date);
      }
    },
    [helpers]
  );

  const handleClear = useCallback(() => {
    setCleared(true);
  }, []);

  const handleSetToday = useCallback(() => {
    helpers.setValue(dayjs());
  }, [helpers]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
      <StyledDatePicker>
        <BaseDatePicker
          {...field}
          {...otherProps}
          format="DD/MM/YYYY"
          value={
            enableButton
              ? field.value === null
                ? null
                : dayjs(field.value, 'DD/MM/YYYY')
              : dayjs()
          }
          onError={(error) => {
            console.error(error);
          }}

          onChange={(date) => {
            if (date) {
              const parsedDate = date.toDate(); // Convert Day.js object to JavaScript Date object
              helpers.setValue(parsedDate);
            } else {
              helpers.setValue(null);
            }
          }}

          label={label}
          slots={{
            textField: useMemo(
              () => (params) => (
                <TextField
                  {...params}
                  InputLabelProps={{ shrink: true }}
                  onBlur={onBlur}
                  error={!!errorMsg}
                  helperText={errorMsg}
                  size="small"
                />
              ),
              [onBlur, errorMsg]
            ),
          }}
          slotProps={{
            field: { clearable: true, onClear: handleClear },
          }}
        />
        {enableButton && (
          <StyledLink
            variant="body2"
            onClick={handleSetToday}
            sx={{ height: '100%', lineHeight: '40px', cursor: 'pointer' }}
          >
            Today
          </StyledLink>
        )}
      </StyledDatePicker>
    </LocalizationProvider>
  );
};

export default DatePicker;
