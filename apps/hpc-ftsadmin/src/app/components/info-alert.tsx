import { Alert } from '@mui/material';
import { util } from '@unocha/hpc-core';
import { type CSSProperties, useState } from 'react';
import { type LocalStorageSchema } from '../utils/local-storage-type';

type InfoAlertProps = {
  text: string;
  localStorageKey: keyof LocalStorageSchema;
  sxProps?: CSSProperties;
};
const InfoAlert = ({ text, localStorageKey, sxProps }: InfoAlertProps) => {
  const [isOpen, setIsOpen] = useState(
    util.getLocalStorageItem<LocalStorageSchema>(localStorageKey, true)
  );

  const handleClose = () => {
    util.setLocalStorageItem<LocalStorageSchema>(localStorageKey, false);
    setIsOpen(false);
  };

  return (
    <Alert
      severity="info"
      onClose={handleClose}
      sx={{
        ...sxProps,
        display: isOpen ? 'flex' : 'none',
      }}
    >
      {text}
    </Alert>
  );
};

export default InfoAlert;
