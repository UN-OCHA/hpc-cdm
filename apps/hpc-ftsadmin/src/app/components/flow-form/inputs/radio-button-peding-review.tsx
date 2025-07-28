import { Box, type SxProps, type Theme } from '@mui/material';
import { C, type RadioButtonFieldProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type RadioButtonFieldReviewProps<T extends string> = {
  sx?: SxProps<Theme>;
} & Omit<RadioButtonFieldProps<T>, 'name'> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

const RadioButtonFieldReview = <T extends string>(
  props: RadioButtonFieldReviewProps<T>
) => {
  const {
    fieldName,
    pendingValues,
    onClick,
    setPendingValuesHandled,
    shouldAcceptChange,
    ...radioButtonFieldProps
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
      <C.RadioButtonField {...radioButtonFieldProps} name={fieldName} />
      <ReviewPendingValues
        {...reviewPendingValuesProps}
        componentType="Radio"
      />
    </Box>
  );
};

export default RadioButtonFieldReview;
