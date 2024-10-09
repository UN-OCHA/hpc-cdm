import { C, type RadioButtonFieldProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';
import { Box, SxProps, Theme } from '@mui/material';

type RadioButtonFieldReviewProps = { sx?: SxProps<Theme> } & Omit<
  RadioButtonFieldProps,
  'name'
> &
  ReviewPendingValuesProps;

const RadioButtonFieldReview = (props: RadioButtonFieldReviewProps) => {
  const { fieldName, pendingValues, onClick, ...radioButtonFieldProps } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    onClick,
  };
  return (
    <Box sx={props.sx}>
      <ReviewPendingValues {...reviewPendingValuesProps} />
      <C.RadioButtonField {...radioButtonFieldProps} name={fieldName} />
    </Box>
  );
};

export default RadioButtonFieldReview;
