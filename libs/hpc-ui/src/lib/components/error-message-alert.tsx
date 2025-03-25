import { Alert, Snackbar } from '@mui/material';
import Grow, { GrowProps } from '@mui/material/Grow';
import tw from 'twin.macro';

const AlertWrapper = tw.div`
  mb-4
`;

type ErrorAlertProps<T> = {
  setError: React.Dispatch<React.SetStateAction<T | undefined>>;
  error?: string;
};
const ErrorAlert = <T,>({ setError, error }: ErrorAlertProps<T>) => {
  function GrowTransition(props: GrowProps) {
    return <Grow {...props} />;
  }

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(undefined);
  };

  return (
    <Snackbar
      key={new Date().getTime()}
      open={!!error}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={GrowTransition}
    >
      <AlertWrapper>
        <Alert severity="error" onClose={handleClose}>
          {error}
        </Alert>
      </AlertWrapper>
    </Snackbar>
  );
};

export default ErrorAlert;
