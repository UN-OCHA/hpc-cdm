import { C, type AsyncAutocompleteSelectProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type AsyncAutocompleteSelectReviewProps = Omit<
  AsyncAutocompleteSelectProps,
  'name'
> &
  ReviewPendingValuesProps;

const AsyncAutocompleteSelectReview = (
  props: AsyncAutocompleteSelectReviewProps
) => {
  const { fieldName, pendingValues, onClick, ...asyncAutocompleteSelectProps } =
    props;

  const reviewPendingValuesProps = {
    fieldName,
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
