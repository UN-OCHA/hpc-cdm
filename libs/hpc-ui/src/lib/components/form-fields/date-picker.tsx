import { useField } from 'formik';
import { TextField, Link } from '@mui/material';
import { DatePicker as BaseDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import tw from 'twin.macro';
import dayjs from '../../i18n/utils/dayjs';
import { useEffect, useState } from 'react';

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
            field: { clearable: true, onClear: () => setCleared(true) },
          }}
          sx={tw`w-full`}
        />
        {enableButton && (
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => {
              helpers.setValue(dayjs());
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
