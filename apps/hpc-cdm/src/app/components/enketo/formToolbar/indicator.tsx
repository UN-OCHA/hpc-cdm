import { CircularProgress, Tooltip } from '@mui/material';
import { styled } from '@unocha/hpc-ui';
import React, { useContext } from 'react';
import { MdLock, MdLockOpen, MdWarning } from 'react-icons/md';
import { AppContext } from '../../../context';

import { type reportingWindows } from '@unocha/hpc-data';
import { t } from '../../../../i18n';
import { type FormStatus } from '../types';

interface Props {
  isLoading: boolean;
  isEditable: boolean;
  isFormTouched: boolean;
  formStatus: FormStatus;
  reportingWindow: reportingWindows.ReportingWindow;
  assignmentState: reportingWindows.AssignmentState;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

// Styles for status bar
const StatusTooltip = Tooltip;

const UnsavedChanges = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${(p) => p.theme.colors.text};
  font-weight: bold;

  > span {
    color: ${(p) => p.theme.colors.textLight};
    font-weight: normal;

    &::before {
      content: '( ';
    }

    &::after {
      content: ' )';
    }
  }
`;

const StatusLabel = styled.div`
  display: flex;
  align-items: center;
  height: 50px;

  > span {
    margin: 0 ${(p) => p.theme.marginPx.md}px;
    display: flex;
    align-items: end;

    > svg {
      margin: 0 ${(p) => p.theme.marginPx.sm}px;
    }
  }

  > svg.error {
    color: ${(p) => p.theme.colors.textError};
  }
`;

const StatusDetails = styled.div`
  font-size: 1.2rem;

  > .error {
    color: ${(p) => p.theme.colors.textErrorLight};
  }
`;

const Indicator = (props: Props) => {
  const { lang } = useContext(AppContext);
  const {
    formStatus,
    reportingWindow,
    lastUpdatedAt,
    lastUpdatedBy,
    isLoading,
    assignmentState,
    isEditable,
    isFormTouched,
  } = props;

  const isSurveySubmitted =
    assignmentState !== 'not-entered' && assignmentState !== 'raw:entered';

  const stateString = t.t(
    lang,
    (s) =>
      s.routes.operations.forms.editability[
        isSurveySubmitted && isEditable
          ? 'submittedEditable'
          : isSurveySubmitted && !isEditable
            ? 'submittedNonEditable'
            : !isSurveySubmitted && isEditable
              ? 'notSubmittedEditable'
              : reportingWindow.state === 'pending'
                ? 'reportingWindowPending'
                : reportingWindow.state === 'closed'
                  ? 'reportingWindowClosed'
                  : 'notSubmittedNotEditable'
      ]
  );

  return (
    <StatusTooltip
      arrow
      title={
        <StatusDetails>
          {formStatus.type === 'error' && (
            <p className="error">{formStatus.message}</p>
          )}
          <p>
            {t
              .t(lang, (s) => s.common.updatedAtBy)
              .replace('{timeAgo}', lastUpdatedAt)
              .replace('{person}', lastUpdatedBy)}
          </p>
        </StatusDetails>
      }
    >
      <StatusLabel>
        {isLoading ? (
          <>
            <span>
              {t.t(lang, (s) => s.routes.operations.forms.status.init)}
            </span>
            <CircularProgress size={20} />
          </>
        ) : (
          <>
            {isEditable ? <MdLockOpen size={20} /> : <MdLock size={20} />}
            <span>{stateString}</span>
            {isEditable && (
              <span>
                {formStatus.type === 'idle' ? (
                  isFormTouched ? (
                    <UnsavedChanges>
                      {t.t(
                        lang,
                        (s) => s.routes.operations.forms.status.unsavedChanges
                      )}
                      <span>
                        {t.t(
                          lang,
                          (s) =>
                            s.routes.operations.forms.status.unsavedChangesExtra
                        )}
                      </span>
                    </UnsavedChanges>
                  ) : (
                    t.t(lang, (s) => s.routes.operations.forms.status.idle)
                  )
                ) : formStatus.type === 'saving' ? (
                  <>
                    <span>
                      {t.t(
                        lang,
                        (s) => s.routes.operations.forms.status[formStatus.type]
                      )}
                    </span>
                    <CircularProgress size={20} />
                  </>
                ) : (
                  <>
                    <span>
                      {t.t(
                        lang,
                        (s) => s.routes.operations.forms.status[formStatus.type]
                      )}
                    </span>
                    <MdWarning className="error" size={20} />
                  </>
                )}
              </span>
            )}
          </>
        )}
      </StatusLabel>
    </StatusTooltip>
  );
};

export default Indicator;
