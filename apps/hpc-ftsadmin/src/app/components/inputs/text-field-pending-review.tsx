import { C, type TextFieldWrapperProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type TextFieldReviewProps = Omit<TextFieldWrapperProps, 'name'> &
  ReviewPendingValuesProps;

const TextFieldReview = (props: TextFieldReviewProps) => {
  const { fieldName, pendingValues, onClick, ...textFieldProps } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    onClick,
  };
  return (
    <div>
      <ReviewPendingValues {...reviewPendingValuesProps} />
      <C.TextFieldWrapper {...textFieldProps} name={fieldName} />
    </div>
  );
};

export default TextFieldReview;
