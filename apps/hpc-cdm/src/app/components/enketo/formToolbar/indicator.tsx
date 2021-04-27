import React, { useContext } from 'react';
import { styled } from '@unocha/hpc-ui';
import { Tooltip, CircularProgress } from '@material-ui/core';
import { MdWarning, MdLock, MdLockOpen } from 'react-icons/md';
import { AppContext } from '../../../context';

import { t } from '../../../../i18n';
import { reportingWindows } from '@unocha/hpc-data';
import { FormStatus } from '../types';

interface Props {
  loading: boolean;
  editable: boolean;
  formTouched: boolean;
  formStatus: FormStatus;
  canModifyWhenClean: boolean;
  assignmentState: reportingWindows.AssignmentState;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

// Styles for status bar
const StatusTooltip = Tooltip;

const NotSubmitted = styled.span`
  color: ${(p) => p.theme.colors.pallete.blue.dark2};
`;

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
    lastUpdatedAt,
    lastUpdatedBy,
    loading,
    assignmentState,
    editable,
    canModifyWhenClean,
    formTouched,
  } = props;
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
        {loading ? (
          <>
            <span>
              {t.t(lang, (s) => s.routes.operations.forms.status.init)}
            </span>
            <CircularProgress size={20} />
          </>
        ) : (
          <>
            {!editable ? (
              <span>
                <MdLock size={20} />
                {t.t(
                  lang,
                  (s) =>
                    s.routes.operations.forms.editability.submittedNonEditable
                )}
              </span>
            ) : (
              <NotSubmitted>
                <MdLockOpen size={20} />
                {t.t(lang, (s) =>
                  assignmentState === 'raw:entered'
                    ? s.routes.operations.forms.editability.notSubmittedEditable
                    : s.routes.operations.forms.editability.submittedEditable
                )}
              </NotSubmitted>
            )}
            {(editable || canModifyWhenClean) && (
              <span>
                {formStatus.type === 'idle' ? (
                  formTouched ? (
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
