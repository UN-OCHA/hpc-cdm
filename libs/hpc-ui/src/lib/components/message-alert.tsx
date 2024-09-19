import { Alert, Snackbar } from '@mui/material';
import Grow, { GrowProps } from '@mui/material/Grow';
import tw from 'twin.macro';

const AlertWrapper = tw.div`
  mb-4
`;

type MessageAlertProps<T> = {
  setMessage: React.Dispatch<React.SetStateAction<T | undefined>>;
  severity: 'info' | 'error' | 'success' | 'warning';
  message?: string;
};
const MessageAlert = <T,>({
  setMessage,
  message,
  severity,
}: MessageAlertProps<T>) => {
  function GrowTransition(props: GrowProps) {
    return <Grow {...props} />;
  }

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setMessage(undefined);
  };

  return (
    <Snackbar
      key={new Date().getTime()}
      open={!!message}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={GrowTransition}
    >
      <AlertWrapper>
        <Alert severity={severity} onClose={handleClose}>
          {message}
        </Alert>
      </AlertWrapper>
    </Snackbar>
  );
};

export default MessageAlert;
