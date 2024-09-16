import { Link, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as BaseDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useField } from 'formik';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import dayjs from '../../i18n/utils/dayjs';

const StyledDatePicker = tw.div`
  w-full
  items-baseline
`;

const StyledLink = tw(Link)`
  ms-8
`;

const DatePicker = ({
  name,
  label,
  lang = 'en',
  enableButton = true,
}: {
  name: string;
  label: string;
  lang?: string;
  enableButton?: boolean;
}) => {
  const [field, , helpers] = useField(name);
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    if (isCleared) {
      const timeout = setTimeout(() => {
        setIsCleared(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isCleared]);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
      <StyledDatePicker>
        <BaseDatePicker
          {...field}
          format="DD/MM/YYYY"
          value={
            enableButton
              ? field.value === null
                ? null
                : dayjs(field.value)
              : dayjs()
          }
          onError={(error) => {
            console.error(error);
          }}
          onChange={(date) => {
            if (date?.isValid()) {
              helpers.setValue(date);
            }
          }}
          label={label}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            ),
          }}
          slotProps={{
            field: { clearable: true, onClear: () => setIsCleared(true) },
          }}
        />
        {enableButton && (
          <StyledLink
            component="button"
            type="button"
            variant="body2"
            onClick={() => {
              helpers.setValue(dayjs());
            }}
          >
            Today
          </StyledLink>
        )}
      </StyledDatePicker>
    </LocalizationProvider>
  );
};

export default DatePicker;
