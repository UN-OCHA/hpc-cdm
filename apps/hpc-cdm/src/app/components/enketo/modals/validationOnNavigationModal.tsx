import React, { useContext } from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { C } from '@unocha/hpc-ui';

import { t } from '../../../../i18n';
import { AppContext } from '../../../context';

interface Props {
  nextPage: () => void;
  shouldShowValidationConfirmation: boolean;
  closeValidationMessage: () => void;
}

const ValidationOnNavigationModal = (props: Props) => {
  const { lang } = useContext(AppContext);
  const { nextPage, shouldShowValidationConfirmation, closeValidationMessage } =
    props;

  return (
    <Dialog
      open={shouldShowValidationConfirmation}
      onClose={closeValidationMessage}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t.t(lang, (s) => s.routes.operations.forms.invalidData.title)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t.t(
            lang,
            (s) => s.routes.operations.forms.invalidData.infoOnNavigation
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <C.Button
          onClick={closeValidationMessage}
          color="primary"
          shouldAutoFocus
        >
          <span>
            {t.t(lang, (s) => s.routes.operations.forms.invalidData.fixNow)}
          </span>
        </C.Button>
        <C.Button onClick={nextPage} color="primary">
          <span>
            {t.t(lang, (s) => s.routes.operations.forms.invalidData.fixLater)}
          </span>
        </C.Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationOnNavigationModal;
