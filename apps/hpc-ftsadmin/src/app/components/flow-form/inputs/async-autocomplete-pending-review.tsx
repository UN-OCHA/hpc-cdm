import { C, type AsyncAutocompleteSelectProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';
import { Box, type SxProps, type Theme } from '@mui/material';

type AsyncAutocompleteSelectReviewProps = { sx?: SxProps<Theme> } & Omit<
  AsyncAutocompleteSelectProps,
  'name'
> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

const AsyncAutocompleteSelectReview = (
  props: AsyncAutocompleteSelectReviewProps
) => {
  const {
    fieldName,
    pendingValues,
    onClick,
    setPendingValuesHandled,
    shouldAcceptChange,
    ...asyncAutocompleteSelectProps
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
      <C.AsyncAutocompleteSelect
        {...asyncAutocompleteSelectProps}
        name={fieldName}
      />
      <ReviewPendingValues
        {...reviewPendingValuesProps}
        componentType={props.isMulti ? 'MultiAutocomplete' : 'Autocomplete'}
      />
    </Box>
  );
};

export default AsyncAutocompleteSelectReview;
