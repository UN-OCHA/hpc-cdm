import { C, type NumberFieldProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';
import { Box, SxProps, Theme } from '@mui/material';

type NumberFieldReviewProps = { sx?: SxProps<Theme> } & Omit<
  NumberFieldProps,
  'name'
> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

const NumberFieldReview = (props: NumberFieldReviewProps) => {
  const { fieldName, pendingValues, onClick, ...numberFieldProps } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    onClick,
  };
  return (
    <Box sx={props.sx}>
      <ReviewPendingValues {...reviewPendingValuesProps} componentType="Text" />
      <C.NumberField {...numberFieldProps} name={fieldName} />
    </Box>
  );
};

export default NumberFieldReview;
