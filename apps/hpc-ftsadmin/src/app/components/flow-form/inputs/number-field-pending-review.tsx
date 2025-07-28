import { Box, type SxProps, type Theme } from '@mui/material';
import { C, type NumberFieldProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type NumberFieldReviewProps = { sx?: SxProps<Theme> } & Omit<
  NumberFieldProps,
  'name'
> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

const NumberFieldReview = (props: NumberFieldReviewProps) => {
  const {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
    shouldAcceptChange,
    ...numberFieldProps
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
      <C.NumberField {...numberFieldProps} name={fieldName} />
      <ReviewPendingValues {...reviewPendingValuesProps} componentType="Text" />
    </Box>
  );
};

export default NumberFieldReview;
