import { Alert, Snackbar } from '@mui/material';
import Grow, { type GrowProps } from '@mui/material/Grow';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';

export type Message = {
  key: number;
  message: string;
  severity: 'info' | 'error' | 'success' | 'warning';
};

type MessageAlertProps = {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messages: Message[];
};

const AlertWrapper = tw.div`
  mb-4
  max-w-[50vw]
`;

const MessageAlert = ({ setMessages, messages }: MessageAlertProps) => {
  const [message, setMessage] = useState<Message>();

  function GrowTransition(props: GrowProps) {
    return <Grow {...props} />;
  };

  useEffect(() => {
    if (messages?.length === 0) {
      return;
    }
    setMessages((prev) => prev.slice(1));
    setMessage(messages[0]);
  }, [messages, setMessage]);

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setMessage(undefined);
  };

  return (
    <Snackbar
      key={Date.now()}
      open={!!message}
      autoHideDuration={7000}
      onClose={handleClose}
      TransitionComponent={GrowTransition}
    >
      <AlertWrapper>
        <Alert
          severity={message?.severity}
          onClose={handleClose}
          key={message?.key}
        >
          {message?.message}
        </Alert>
      </AlertWrapper>
    </Snackbar>
  );
};

export default MessageAlert;
