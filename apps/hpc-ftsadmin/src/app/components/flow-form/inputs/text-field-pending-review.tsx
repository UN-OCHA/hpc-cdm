import { C, type TextFieldWrapperProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';

type TextFieldReviewProps = Omit<TextFieldWrapperProps, 'name'> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

const TextFieldReview = (props: TextFieldReviewProps) => {
  const {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
    ...textFieldProps
  } = props;

  const reviewPendingValuesProps = {
    fieldName,
    pendingValues,
    setPendingValuesHandled,
    onClick,
  };
  return (
    <div>
      <C.TextFieldWrapper {...textFieldProps} name={fieldName} />
      <ReviewPendingValues {...reviewPendingValuesProps} componentType="Text" />
    </div>
  );
};

export default TextFieldReview;
