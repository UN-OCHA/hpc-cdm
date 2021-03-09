import React, { useContext } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
import { C } from '@unocha/hpc-ui';

import { AppContext } from '../../../context';
import { t } from '../../../../i18n';

interface Props {
  nextPage: () => void;
  showValidationConfirmation: boolean;
  closeValidationMessage: () => void;
}

const ValidationOnNavigationModal = (props: Props) => {
  const { lang } = useContext(AppContext);
  const {
    nextPage,
    showValidationConfirmation,
    closeValidationMessage,
  } = props;

  return (
    <Dialog
      open={showValidationConfirmation}
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
        <C.Button onClick={closeValidationMessage} color="primary" autoFocus>
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
