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
import { SubmissionValidation } from '../types';

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
          autoFocus
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
