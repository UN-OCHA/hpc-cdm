import { Alert } from '@mui/material';
import { CSSProperties, useState } from 'react';
import { LocalStorageSchema } from '../utils/local-storage-type';
import { util } from '@unocha/hpc-core';

type InfoAlertProps = {
  text: string;
  localStorageKey: keyof LocalStorageSchema;
  sxProps?: CSSProperties;
};
const InfoAlert = ({ text, localStorageKey, sxProps }: InfoAlertProps) => {
  const [open, setOpen] = useState(
    util.getLocalStorageItem<LocalStorageSchema>(localStorageKey, true)
  );

  const handleClose = () => {
    util.setLocalStorageItem<LocalStorageSchema>(localStorageKey, false);
    setOpen(false);
  };

  return (
    <Alert
      severity="info"
      onClose={handleClose}
      sx={{
        ...sxProps,
        display: open ? 'flex' : 'none',
      }}
    >
      {text}
    </Alert>
  );
};

export default InfoAlert;
