import { type AutocompleteSelectProps, C } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type AutocompleteSelectReviewProps = Omit<AutocompleteSelectProps, 'name'> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

const AutocompleteSelectReview = (props: AutocompleteSelectReviewProps) => {
  const {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
    ...asyncAutocompleteSelectProps
  } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
  };
  return (
    <div>
      <ReviewPendingValues
        {...reviewPendingValuesProps}
        componentType="Autocomplete"
      />
      <C.AutocompleteSelect
        {...asyncAutocompleteSelectProps}
        name={fieldName}
      />
    </div>
  );
};

export default AutocompleteSelectReview;
