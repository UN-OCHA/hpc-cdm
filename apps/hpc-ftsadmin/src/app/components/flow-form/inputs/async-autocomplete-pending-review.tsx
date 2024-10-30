import { C, type AsyncAutocompleteSelectProps } from '@unocha/hpc-ui';
import ReviewPendingValues, {
  type ReviewPendingValuesProps,
} from './review-pending-values';
import { Box, SxProps, Theme } from '@mui/material';

type AsyncAutocompleteSelectReviewProps = { sx?: SxProps<Theme> } & Omit<
  AsyncAutocompleteSelectProps,
  'name'
> &
  Omit<ReviewPendingValuesProps, 'componentType'>;

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
    <Box sx={props.sx}>
      <ReviewPendingValues
        {...reviewPendingValuesProps}
        componentType={props.isMulti ? 'MultiAutocomplete' : 'Autocomplete'}
      />
      <C.AsyncAutocompleteSelect
        {...asyncAutocompleteSelectProps}
        name={fieldName}
      />
    </Box>
  );
};

export default AsyncAutocompleteSelectReview;
