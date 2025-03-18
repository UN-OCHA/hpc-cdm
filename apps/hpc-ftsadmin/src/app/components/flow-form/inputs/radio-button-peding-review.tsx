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
    ...radioButtonFieldProps
  } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
  };
  return (
    <Box sx={props.sx}>
      <ReviewPendingValues
        {...reviewPendingValuesProps}
        componentType="Radio"
      />
      <C.RadioButtonField {...radioButtonFieldProps} name={fieldName} />
    </Box>
  );
};

export default RadioButtonFieldReview;
