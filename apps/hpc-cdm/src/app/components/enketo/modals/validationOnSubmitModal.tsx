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
import { type SubmissionValidation } from '../types';

interface Props {
  submissionValidation: SubmissionValidation;
  closeInvalidSubmissionMessage: () => void;
}

const ValidationOnSubmitModal = (props: Props) => {
  const { lang } = useContext(AppContext);
  const { submissionValidation, closeInvalidSubmissionMessage } = props;

  return (
    <Dialog
      open={submissionValidation === 'invalid'}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t.t(lang, (s) => s.routes.operations.forms.invalidData.title)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t.t(lang, (s) => s.routes.operations.forms.invalidData.infoOnSubmit)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <C.Button
          onClick={closeInvalidSubmissionMessage}
          color="primary"
          shouldAutoFocus
        >
          <span>
            {t.t(lang, (s) => s.routes.operations.forms.invalidData.okay)}
          </span>
        </C.Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationOnSubmitModal;
