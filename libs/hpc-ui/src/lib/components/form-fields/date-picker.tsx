import { useCallback, useMemo } from 'react';
import { useField } from 'formik';
import { TextField, Link } from '@mui/material';
import { DatePicker as BaseDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import tw from 'twin.macro';
import dayjs from 'dayjs';

const StyledDatePicker = tw.div`
flex
w-full
items-baseline
mb-6
`;

const StyledLink = tw(Link)`
ml-8
`;

const DatePicker = ({
  name,
  label,
  ...otherProps
}: {
  name: string;
  label: string;
}) => {
  const [field, meta, helpers] = useField(name);
  const onBlur = useCallback(() => helpers.setTouched(true), [helpers]);
  const errorMsg = useMemo(
    () =>
      meta.touched && Boolean(meta.error)
        ? meta.touched && (meta.error as string)
        : null,
    [meta.touched, meta.error]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatePicker>
        <BaseDatePicker
          {...field}
          {...otherProps}
          value={field.value ? dayjs(field.value) : null}
          onChange={(date) => {
            helpers.setValue(date?.format('MM/DD/YYYY'));
          }}
          label={label}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                onBlur={onBlur}
                error={!!errorMsg}
                helperText={errorMsg}
                sx={{ height: '40px' }}
              />
            ),
          }}
        />
        {field.value !== dayjs().format('MM/DD/YYYY') && (
          <StyledLink
            component="button"
            variant="body2"
            onClick={() => {
              helpers.setValue(dayjs().format('MM/DD/YYYY'));
            }}
            sx={{ height: '100%', lineHeight: '40px' }}
          >
            Today
          </StyledLink>
        )}
      </StyledDatePicker>
    </LocalizationProvider>
  );
};

export default DatePicker;
