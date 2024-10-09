import { C, type DatePickerProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';
import { Box, SxProps, Theme } from '@mui/material';

type DatePickerReviewProps = { sx?: SxProps<Theme> } & Omit<
  DatePickerProps,
  'name'
> &
  ReviewPendingValuesProps;

const DatePickerReview = (props: DatePickerReviewProps) => {
  const { fieldName, pendingValues, onClick, ...datePickerProps } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    onClick,
  };
  return (
    <Box sx={props.sx}>
      <ReviewPendingValues {...reviewPendingValuesProps} />
      <C.DatePicker {...datePickerProps} name={fieldName} />
    </Box>
  );
};

export default DatePickerReview;
