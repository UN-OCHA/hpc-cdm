import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Button } from './button';

type HPCDialog =
  | {
      type: 'confirm';
      callback: (result: boolean) => void;
      title?: string;
      message?: string;
      buttonConfirm: string;
      buttonCancel: string;
    }
  | {
      type: 'alert';
      title?: string;
      message?: string;
      dismiss?: {
        callback: () => void;
        dismissButton?: string;
      };
    };

let hooks: null | {
  addDialog: (dialog: HPCDialog) => void;
  removeDialog: (dialog: HPCDialog) => void;
} = null;

export const openDialog = (dialog: HPCDialog) => {
  if (!hooks) {
    throw new Error('Dialogs component not mounted');
  } else {
    hooks.addDialog(dialog);
  }
};

export const confirm = ({
  title,
  message,
  buttonConfirm,
  buttonCancel,
}: {
  title?: string;
  message?: string;
  buttonConfirm: string;
  buttonCancel: string;
}): Promise<boolean> => {
  return new Promise((resolve) => {
    openDialog({
      type: 'confirm',
      title,
      message,
      buttonConfirm,
      buttonCancel,
      callback: resolve,
    });
  });
};

export const alert = ({
  title,
  message,
  dismissButton,
}: {
  title?: string;
  message?: string;
  dismissButton: string;
}): Promise<void> => {
  return new Promise((resolve) => {
    openDialog({
      type: 'alert',
      title,
      message,
      dismiss: {
        dismissButton,
        callback: resolve,
      },
    });
  });
};

/**
 * Create an alert that can't be dismissed by the user and instead must be
 * dismissed by the alert creator
 */
export const controlledAlert = ({
  title,
  message,
}: {
  title?: string;
  message?: string;
}): {
  dismiss: () => void;
} => {
  const d: HPCDialog = {
    type: 'alert',
    title,
    message,
  };
  openDialog(d);
  return {
    dismiss: () => hooks?.removeDialog(d),
  };
};

/**
 * A component that can be mounted into an app once,
 * and allows for dialog boxes to be opened from anywhere else in the app.
 */
export const Dialogs = () => {
  const [dialogs, setDialogs] = useState<HPCDialog[]>([]);

  useEffect(() => {
    hooks = {
      addDialog: (dialog) => {
        setDialogs((dialogs) => [...dialogs, dialog]);
      },
      removeDialog: (dialog) => {
        setDialogs((dialogs) => dialogs.filter((d) => d !== dialog));
      },
    };

    return () => {
      hooks = null;
    };
  }, [dialogs]);

  return (
    <>
      {dialogs.map((d, i) => {
        const close = () => {
          setDialogs((dialogs) => dialogs.filter((other) => other !== d));
        };

        if (d.type === 'alert') {
          const dismiss = () => {
            close();
            d.dismiss?.callback();
          };

          return (
            <Dialog
              key={i}
              open={true}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              {d.title && (
                <DialogTitle id="alert-dialog-title">{d.title}</DialogTitle>
              )}
              {d.message && (
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {d.message}
                  </DialogContentText>
                </DialogContent>
              )}
              {d.dismiss && (
                <DialogActions>
                  <Button onClick={dismiss} color="primary" autoFocus>
                    <span>{d.dismiss.dismissButton}</span>
                  </Button>
                </DialogActions>
              )}
            </Dialog>
          );
        }

        if (d.type === 'confirm') {
          const confirm = () => {
            close();
            d.callback(true);
          };

          const cancel = () => {
            close();
            d.callback(false);
          };

          return (
            <Dialog
              key={i}
              open={true}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              {d.title && (
                <DialogTitle id="alert-dialog-title">{d.title}</DialogTitle>
              )}
              {d.message && (
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {d.message}
                  </DialogContentText>
                </DialogContent>
              )}
              <DialogActions>
                <Button onClick={cancel} color="primary">
                  <span>{d.buttonCancel}</span>
                </Button>
                <Button onClick={confirm} color="primary" autoFocus>
                  <span>{d.buttonConfirm}</span>
                </Button>
              </DialogActions>
            </Dialog>
          );
        }
      })}
    </>
  );
};
