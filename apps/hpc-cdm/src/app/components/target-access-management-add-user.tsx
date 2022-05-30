import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { C, ActionableButtonState, styled } from '@unocha/hpc-ui';
import { access, errors } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { getContext } from '../context';

interface Props {
  target: access.AccessTarget;
  open: boolean;
  setOpen: (open: boolean) => void;
  updateLoadedData: (data: access.GetTargetAccessResult) => void;
  roles: string[];
}

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: ${(p) => p.theme.marginPx.md}px 0;
`;

const ErrorText = styled(DialogContentText)`
  color: ${(p) => p.theme.colors.textError};
`;

type SubmissionState =
  | {
      type: 'idle';
    }
  | {
      type: 'userError';
      error: string;
      emailInvalid: boolean;
    }
  | {
      type: 'unknownError';
      error: string;
    }
  | {
      type: 'submitting';
    };

export const TargetAccessManagementAddUser = (props: Props) => {
  const { open, setOpen, roles, target, updateLoadedData } = props;
  const { lang, env } = getContext();

  const [emailInputValue, setEmailInputValue] = useState<string>('');
  const [roleInputValue, setRoleInputValue] = useState<string>(roles[0]);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    type: 'idle',
  });

  const getRoleName = (key: string) =>
    t.t(
      lang,
      (s) =>
        (s.components.accessControl.roles as { [id: string]: string })[key] ||
        key
    );

  const submit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event && event.preventDefault();
    if (emailInputValue === '') {
      setSubmissionState({
        type: 'userError',
        emailInvalid: true,
        error: t
          .t(lang, (s) => s.common.validation.missing)
          .replace(
            '{field}',
            t.t(lang, (s) => s.common.emailAddress)
          ),
      });
      return;
    }
    setSubmissionState({
      type: 'submitting',
    });
    const data = await env()
      .model.access.addTargetAccess({
        target,
        email: emailInputValue,
        roles: [roleInputValue],
      })
      .catch((err) => {
        console.log(err);
        if (errors.isUserError(err)) {
          setSubmissionState({
            type: 'userError',
            emailInvalid: true,
            error: t.t(lang, (s) => s.errors.userErrors[err.key]),
          });
          return null;
        } else {
          setSubmissionState({
            type: 'unknownError',
            error: err.message || err.toString(),
          });
          throw err;
        }
      });
    if (data) {
      setSubmissionState({
        type: 'idle',
      });
      setOpen(false);
      updateLoadedData(data);
    }
  };

  const getButtonState = (): ActionableButtonState => {
    if (submissionState.type === 'unknownError') {
      return 'error';
    }
    if (submissionState.type === 'submitting') {
      return 'loading';
    }
    return 'idle';
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>
        {t.t(lang, (s) => s.components.accessControl.addPerson)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t.t(lang, (s) => s.components.accessControl.addPersonInfo)}
        </DialogContentText>
        <form onSubmit={submit}>
          <TextField
            variant="outlined"
            autoFocus
            margin="normal"
            label={t.t(lang, (s) => s.common.emailAddress)}
            type="email"
            value={emailInputValue}
            onChange={(e) => setEmailInputValue(e.target.value)}
            fullWidth
            required
            error={
              submissionState.type === 'userError' &&
              submissionState.emailInvalid
            }
          />
          <FormControl variant="outlined" margin="normal" fullWidth required>
            <InputLabel>
              {t.t(lang, (s) => s.components.accessControl.role)}
            </InputLabel>
            <Select
              label={`${t.t(lang, (s) => s.components.accessControl.role)} *`}
              value={roleInputValue}
              onChange={(e) =>
                typeof e.target.value === 'string' &&
                setRoleInputValue(e.target.value)
              }
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {getRoleName(role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
        {submissionState.type === 'userError' && (
          <ErrorText>{submissionState.error}</ErrorText>
        )}
        <Buttons>
          <C.ActionableButton
            label={t.t(lang, (s) => s.common.add)}
            onClick={submit}
            size="big"
            state={getButtonState()}
          />
        </Buttons>
      </DialogContent>
    </Dialog>
  );
};
