import { C, type AsyncAutocompleteProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type AsyncAutocompleteSelectReviewProps = Omit<AsyncAutocompleteProps, 'name'> &
  ReviewPendingValuesProps;

const AsyncAutocompleteSelectReview = (
  props: AsyncAutocompleteSelectReviewProps
) => {
  const {
    fieldName,
    setFieldValue,
    pendingValues,
    onClick,
    ...asyncAutocompleteSelectProps
  } = props;

  const reviewPendingValuesProps = {
    fieldName,
    setFieldValue,
    pendingValues,
    onClick,
  };
  return (
    <div>
      <ReviewPendingValues {...reviewPendingValuesProps} />
      <C.AsyncAutocompleteSelect
        {...asyncAutocompleteSelectProps}
        name={fieldName}
      />
    </div>
  );
};

export default AsyncAutocompleteSelectReview;
