import { type AutocompleteSelectProps, C } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type AutocompleteSelectReviewProps = Omit<AutocompleteSelectProps, 'name'> &
  ReviewPendingValuesProps;

const AutocompleteSelectReview = (props: AutocompleteSelectReviewProps) => {
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
      <C.AutocompleteSelect
        {...asyncAutocompleteSelectProps}
        name={fieldName}
      />
    </div>
  );
};

export default AutocompleteSelectReview;
