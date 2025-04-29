import { C, type DatePickerProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';
import { Box, SxProps, Theme } from '@mui/material';

type DatePickerReviewProps = { sx?: SxProps<Theme> } & Omit<
  DatePickerProps,
  'name'
> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

const DatePickerReview = (props: DatePickerReviewProps) => {
  const {
    fieldName,
    pendingValues,
    onClick,
    setPendingValuesHandled,
    ...datePickerProps
  } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
  };
  return (
    <Box sx={props.sx}>
      <C.DatePicker {...datePickerProps} name={fieldName} />
      <ReviewPendingValues {...reviewPendingValuesProps} componentType="Date" />
    </Box>
  );
};

export default DatePickerReview;
