import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { reportingWindows, errors } from '@unocha/hpc-data';
import { BreadcrumbLinks, C, CLASSES, styled } from '@unocha/hpc-ui';
import {
  Tooltip,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import { MdWarning } from 'react-icons/md';
import moment from 'moment';

import XForm from './xform';
import { getEnv, AppContext } from '../../context';
import { t } from '../../../i18n';

const StatusTooltip = Tooltip;

const StatusLabel = styled.div`
  display: flex;
  align-items: center;

  > span {
    margin: 0 ${(p) => p.theme.marginPx.md}px;
  }

  > svg.error {
    color: ${(p) => p.theme.colors.textError};
  }
`;

const StatusDetails = styled.div`
  font-size: 0.8rem;

  > .error {
    color: ${(p) => p.theme.colors.textErrorLight};
  }
`;

const SubmitPanel = styled.div`
  border: 1px solid ${(p) => p.theme.colors.text};
  margin: 0 2.85em 2.85em 2.85em;
  padding: 1em 1em 0 1em;
`;

type Status =
  | {
      type: 'idle';
    }
  | {
      type: 'saving';
    }
  | {
      type: 'error';
      message: string;
    }
  | {
      type: 'conflict';
      otherPerson: string;
      timestamp: Date;
    };

interface Props {
  reportingWindow: reportingWindows.ReportingWindow;
  assignment: reportingWindows.GetAssignmentResult;
  breadcrumbs: BreadcrumbLinks;
}

export const EnketoEditableForm = (props: Props) => {
  const {
    breadcrumbs,
    reportingWindow,
    assignment: originalAssignment,
  } = props;
  const env = getEnv();
  const [xform, setXform] = useState<XForm | null>(null);
  const [lastPage, setLastPage] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<string | null>(null);
  const [lastChangedData, setLastChangedData] = useState<string | null>(null);
  const [
    updatedAssignment,
    setUpdatedAssignment,
  ] = useState<reportingWindows.GetAssignmentResult | null>(null);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [editable, setEditable] = useState(true);
  const history = useHistory();
  const { lang } = useContext(AppContext);

  const assignment = updatedAssignment || originalAssignment;

  const lastUpdatedAt = moment(
    status.type === 'conflict' ? status.timestamp : assignment.lastUpdatedAt
  );
  lastUpdatedAt.locale(lang);
  const lastUpdatedBy =
    status.type === 'conflict' ? status.otherPerson : assignment.lastUpdatedBy;

  useEffect(() => {
    const {
      state,
      task: {
        form: {
          definition: { form, model },
        },
        currentData,
        currentFiles,
      },
    } = originalAssignment;

    // Convert the ArrayBuffers to Blobs to use in the form
    const files = currentFiles.map((f) => ({
      name: f.name,
      data: new Blob([new Uint8Array(f.data)]),
    }));
    setEditable(!state.endsWith(':finalized'));
    const xform = new XForm(form, model, currentData, files, {
      editable: !state.endsWith(':finalized'),
      onDataUpdate: ({ xform }) => setLastChangedData(xform.getData().data),
    });
    setXform(xform);
    setLastSavedData(xform.getData().data);
    setUpdatedAssignment(null);
  }, [originalAssignment]);

  useEffect(() => {
    // Setup listeners to prevent navigating away when the form has changed

    const unblock = history.block(() => {
      if (xform) {
        if (lastSavedData !== xform.getData().data) {
          return t.t(
            lang,
            (s) => s.routes.operations.forms.unsavedChangesPrompt
          );
        }
      }
    });

    const unloadListener = (event: BeforeUnloadEvent) => {
      if (xform) {
        if (lastSavedData !== xform.getData().data) {
          event.preventDefault();
          // Chrome requires returnValue to be set.
          event.returnValue = '';
        }
      }
      return event;
    };
    window.addEventListener('beforeunload', unloadListener);

    return () => {
      window.removeEventListener('beforeunload', unloadListener);
      unblock();
    };
  }, [xform, lastSavedData, history, lang]);

  const saveForm = async (redirect = false, finalized = false) => {
    if (xform) {
      const { data, files } = xform.getData();

      if (lastSavedData !== data || finalized) {
        const {
          task: { form },
        } = assignment;
        setStatus({ type: 'saving' });

        // Convert each file Blob to an ArrayBuffer
        const convertedFiles = await Promise.all(
          files.map(async (f) => ({
            name: f.name,
            data: await f.data.arrayBuffer(),
          }))
        );

        return env.model.reportingWindows
          .updateAssignment({
            assignmentId: assignment.id,
            previousVersion: assignment.version,
            form: {
              id: form.id,
              version: form.version,
              data,
              files: convertedFiles,
              finalized,
            },
          })
          .then((assignment) => {
            setLastSavedData(assignment.task.currentData);
            setUpdatedAssignment(assignment);
            setStatus({ type: 'idle' });

            if (redirect) {
              history.goBack();
            }
          })
          .catch((err) => {
            if (errors.isConflictError(err)) {
              const timeAgo = moment(err.timestamp);
              timeAgo.locale(lang);
              alert(
                t
                  .t(lang, (s) => s.routes.operations.forms.errors.conflict)
                  .replace('{timeAgo}', timeAgo.fromNow())
                  .replace('{person}', err.otherUser)
              );
              setStatus({
                type: 'conflict',
                timestamp: err.timestamp,
                otherPerson: err.otherUser,
              });
            } else {
              setStatus({
                type: 'error',
                message: err.message || err.toString(),
              });
            }
          });
      }
    }
  };

  const handleNext = () => {
    if (xform) {
      // Allow enketo to flip the page
      setTimeout(() => {
        setLastPage(xform.isCurrentPageTheLastPage());
      });
    }
  };

  const indicator = () => (
    <StatusTooltip
      arrow
      title={
        <StatusDetails>
          {status.type === 'error' && <p className="error">{status.message}</p>}
          <p>
            {t
              .t(lang, (s) => s.common.updatedAtBy)
              .replace('{timeAgo}', lastUpdatedAt.fromNow())
              .replace('{person}', lastUpdatedBy)}
          </p>
        </StatusDetails>
      }
    >
      <StatusLabel>
        {status.type === 'idle' ? (
          t.t(
            lang,
            (s) =>
              s.routes.operations.forms.status[
                lastChangedData === lastSavedData ? 'idle' : 'unsavedChanges'
              ]
          )
        ) : status.type === 'saving' ? (
          <>
            <span>
              {t.t(lang, (s) => s.routes.operations.forms.status.saving)}
            </span>
            <CircularProgress size={20} />
          </>
        ) : (
          <>
            <span>
              {t.t(lang, (s) => s.routes.operations.forms.status[status.type])}
            </span>
            <MdWarning className="error" size={20} />
          </>
        )}
      </StatusLabel>
    </StatusTooltip>
  );

  const SubmitButton = () => {
    const strings = t.get(lang, (s) => s.routes.operations.forms.nav.submit);
    const [confirmed, setConfirmed] = useState(false);

    return (
      <SubmitPanel>
        <p>{strings.message}</p>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              onChange={(e) => setConfirmed(e.target.checked)}
            />
          }
          label={strings.confirm}
        />
        <div>
          <button
            disabled={!confirmed}
            id="submit-form"
            onClick={() => saveForm(true, true)}
            className="btn btn-primary"
          >
            <i className="icon icon-check"> </i>
            {strings.submit}
          </button>
        </div>
      </SubmitPanel>
    );
  };

  return (
    <div>
      <C.Toolbar>
        <C.Breadcrumbs links={breadcrumbs} />
        <div className={CLASSES.FLEX.GROW} />
        {editable ? indicator() : t.t(lang, (s) => s.common.nonEditable)}
      </C.Toolbar>
      <div className="enketo" id="form">
        <div className="main">
          <div className="container pages"></div>
          <section className="form-footer end">
            <div className="form-footer__content">
              <div className="form-footer__content__main-controls">
                <button
                  onMouseDown={() => setLastPage(false)}
                  className="btn btn-default previous-page disabled"
                >
                  {t.t(lang, (s) => s.routes.operations.forms.nav.prev)}
                </button>
                {editable && (
                  <button
                    onClick={() => saveForm()}
                    className="btn btn-default"
                    style={{ display: 'inline-block' }}
                  >
                    {t.t(lang, (s) => s.routes.operations.forms.nav.save)}
                  </button>
                )}
                <button
                  onMouseDown={() => {
                    if (editable) {
                      saveForm();
                      handleNext();
                    }
                  }}
                  className="btn btn-primary next-page disabled"
                >
                  {t.t(lang, (s) => s.routes.operations.forms.nav.next)}
                </button>
                {editable && lastPage && <SubmitButton />}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
