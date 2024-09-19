import { C, type NumberFieldProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type NumberFieldReviewProps = Omit<NumberFieldProps, 'name'> &
  ReviewPendingValuesProps;

const NumberFieldReview = (props: NumberFieldReviewProps) => {
  const { fieldName, pendingValues, onClick, ...numberFieldProps } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    onClick,
  };
  return (
    <div>
      <ReviewPendingValues {...reviewPendingValuesProps} />
      <C.NumberField {...numberFieldProps} name={fieldName} />
    </div>
  );
};

export default NumberFieldReview;
