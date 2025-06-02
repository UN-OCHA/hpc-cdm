import { C, type DatePickerProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';
import { Box, type SxProps, type Theme } from '@mui/material';

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
    shouldAcceptChange,
    ...datePickerProps
  } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
    shouldAcceptChange,
  };
  return (
    <Box sx={props.sx}>
      <C.DatePicker {...datePickerProps} name={fieldName} />
      <ReviewPendingValues {...reviewPendingValuesProps} componentType="Date" />
    </Box>
  );
};

export default DatePickerReview;
