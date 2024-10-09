import { useField } from 'formik';
import { TextField, Link } from '@mui/material';
import { DatePicker as BaseDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import tw from 'twin.macro';
import dayjs from '../../i18n/utils/dayjs';
import { useEffect, useState } from 'react';

const StyledDatePicker = tw.div`
  flex
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
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        setCleared(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [cleared]);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
      <StyledDatePicker>
        <BaseDatePicker
          {...field}
          format="YYYY/MM/DD"
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
            field: { clearable: true, onClear: () => setCleared(true) },
          }}
        />
        {enableButton && (
          <StyledLink
            component="button"
            variant="body2"
            onClick={() => {
              helpers.setValue(dayjs());
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
