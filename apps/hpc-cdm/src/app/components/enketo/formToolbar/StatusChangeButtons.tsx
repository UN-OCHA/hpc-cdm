import React, { useContext, Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router-dom';

import { styled, C } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';
import { AppContext, getEnv } from '../../../context';
import { t } from '../../../../i18n';
import { FormStatus } from '../types';

interface Props {
  loading: boolean;
  assignment: reportingWindows.GetAssignmentResult;
  setStatus: Dispatch<SetStateAction<FormStatus>>;
  editable: boolean;
}

const ChangeStateButton = styled(C.Button)`
  margin: 0 1rem;
`;

const StatusChangeButtons = (props: Props) => {
  const history = useHistory();
  const env = getEnv();
  const { lang } = useContext(AppContext);
  const { assignment, setStatus, editable } = props;

  const onStatusChangeClick = (state: reportingWindows.AssignmentState) => {
    setStatus({ type: 'saving' });
    env.model.reportingWindows
      .updateAssignment({
        assignmentId: assignment.id,
        state,
      })
      .then(() => {
        history.go(0);
      })
      .catch((err) => {
        setStatus({
          type: 'error',
          message: err.message || err.toString(),
        });
      });
  };

  return (
    <>
      {assignment.state !== 'raw:entered' &&
        assignment.permissions.canModifyWhenClean && (
          <ChangeStateButton
            color="neutral"
            onClick={() => onStatusChangeClick('raw:entered')}
          >
            <span>
              {t.t(
                lang,
                (s) => s.routes.operations.forms.statusChange.unsubmit
              )}
            </span>
          </ChangeStateButton>
        )}
      {!editable && assignment.permissions.canModifyWhenClean && (
        <span>
          <ChangeStateButton
            color="neutral"
            onClick={() => onStatusChangeClick('clean:entered')}
          >
            <span>
              {t.t(lang, (s) => s.routes.operations.forms.statusChange.unlock)}
            </span>
          </ChangeStateButton>
        </span>
      )}
    </>
  );
};

export default StatusChangeButtons;
