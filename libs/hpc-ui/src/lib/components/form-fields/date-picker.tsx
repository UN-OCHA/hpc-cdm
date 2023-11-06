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
  const [field, , helpers] = useField(name);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatePicker>
        <BaseDatePicker
          {...field}
          {...otherProps}
          value={field.value}
          onChange={(date) => {
            helpers.setValue(date);
          }}
          label={label}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                InputLabelProps={{ shrink: true }}
                sx={{ height: '40px' }}
              />
            ),
          }}
        />
        {}
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
      </StyledDatePicker>
    </LocalizationProvider>
  );
};

export default DatePicker;
