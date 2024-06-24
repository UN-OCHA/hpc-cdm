import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useField } from 'formik';
import { TextField, Link } from '@mui/material';
import { DatePicker as BaseDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import tw from 'twin.macro';
import dayjs, { Dayjs } from 'dayjs';
import { DateValidationError } from '@mui/x-date-pickers/models/validation';
import { TextFieldProps } from '@mui/material/TextField';
import { BaseDatePickerProps } from '@mui/x-date-pickers/DatePicker/shared';

const StyledDatePicker = tw.div`
  flex
  w-full
  items-baseline
`;

const StyledLink = tw(Link)`
  ms-8
`;

type DatePickerProps = {
  name: string;
  label: string;
  lang?: string;
  enableButton?: boolean;
} & BaseDatePickerProps<Dayjs>;

const DatePicker = memo(
  ({
    name,
    label,
    lang = 'en',
    enableButton = true,
    ...otherProps
  }: DatePickerProps) => {
    const [field, meta, helpers] = useField(name);
    const [cleared, setCleared] = useState(false);

    const linkStyles = {
      height: '100%',
      lineHeight: '40px',
      cursor: 'pointer',
    };

    const onBlur = useCallback(() => {
      helpers.setTouched(true);
    }, [helpers]);

    const errorMsg = useMemo(() => {
      return meta.touched && Boolean(meta.error)
        ? (meta.error as string)
        : null;
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

    const memoizedValue = useMemo(() => {
      if (enableButton) {
        return field.value === null ? null : dayjs(field.value, 'DD/MM/YYYY');
      } else {
        return dayjs();
      }
    }, [enableButton, field.value]);

    const handleError = useCallback(
      (error: DateValidationError, value: Dayjs | null) => {
        if (error) {
          console.error(`Date validation error: ${error} for value: ${value}`);
        }
      },
      []
    );

    const renderInput = useCallback(
      (params: TextFieldProps) => (
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
    );

    const slots = useMemo(
      () => ({
        textField: renderInput,
      }),
      [renderInput]
    );

    const slotProps = useMemo(
      () => ({
        field: { clearable: true, onClear: handleClear },
      }),
      [handleClear]
    );

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
        <StyledDatePicker>
          <BaseDatePicker
            {...field}
            {...otherProps}
            format="DD/MM/YYYY"
            value={memoizedValue}
            onError={handleError}
            onChange={handleDateChange}
            label={label}
            slots={slots}
            slotProps={slotProps}
          />
          {enableButton && (
            <StyledLink
              variant="body2"
              onClick={handleSetToday}
              sx={linkStyles}
            >
              Today
            </StyledLink>
          )}
        </StyledDatePicker>
      </LocalizationProvider>
    );
  }
);

export default DatePicker;
