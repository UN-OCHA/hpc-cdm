import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { reportingWindows, errors } from '@unocha/hpc-data';
import { C, CLASSES, styled } from '@unocha/hpc-ui';
import { Tooltip, CircularProgress } from '@material-ui/core';
import { MdWarning } from 'react-icons/md';
import dayjs from '../../../libraries/dayjs';

import XForm from './xform';
import { getEnv, AppContext } from '../../context';
import { t } from '../../../i18n';
import SubmitButton from './submit-button';
import { toast } from 'react-toastify';

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
}

export const EnketoEditableForm = (props: Props) => {
  const { reportingWindow, assignment: originalAssignment } = props;
  const env = getEnv();
  const [loading, setLoading] = useState(true);
  const [xform, setXform] = useState<XForm | null>(null);
  const [lastPage, setLastPage] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<string | null>(null);
  const [lastChangedData, setLastChangedData] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState(false);
  const [
    updatedAssignment,
    setUpdatedAssignment,
  ] = useState<reportingWindows.GetAssignmentResult | null>(null);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [editable, setEditable] = useState(true);
  const history = useHistory();
  const { lang } = useContext(AppContext);

  const assignment = updatedAssignment || originalAssignment;

  const lastUpdatedAt = dayjs(
    status.type === 'conflict' ? status.timestamp : assignment.lastUpdatedAt
  ).locale(lang);
  const lastUpdatedBy =
    status.type === 'conflict' ? status.otherPerson : assignment.lastUpdatedBy;

  const unMount = () => {
    if (xform) {
      xform.resetView();
    }
    // Clears enketo cache or something going on there which slows down
    // form re-init/getData.
    history.go(0);
  };

  useEffect(() => {
    return () => {
      unMount();
    };
  }, []);

  useEffect(() => {
    let isSubscribed = true; // to cancel form initialization
    const {
      state,
      editable,
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
    const xform = new XForm(form, model, currentData, files, {
      titlePrefix: reportingWindow.name,
      onDataUpdate: ({ xform }) => {
        setFormTouched(true);
      },
    });
    const timer = setTimeout(() => {
      // Long running process, it could take up to 20 seconds
      // depending on number of embedded locations/sublocations.
      xform.init(editable).then(() => {
        if (isSubscribed) {
          // user has abandoned this page
          setXform(xform);
          setEditable(editable);
          setUpdatedAssignment(null);
          setLoading(false);
        }
      });
    });
    return () => {
      clearTimeout(timer);
      isSubscribed = false;
      setLoading(false);
    };
  }, [originalAssignment]);

  useEffect(() => {
    // Setup listeners to prevent navigating away when the form has changed
    if (!loading) {
      const unblock = history.block(() => {
        if (xform && formTouched) {
          return t.t(
            lang,
            (s) => s.routes.operations.forms.unsavedChangesPrompt
          );
        }
      });

      const unloadListener = (event: BeforeUnloadEvent) => {
        if (xform && formTouched) {
          event.preventDefault();
          // Chrome requires returnValue to be set.
          event.returnValue = '';
        }
        return event;
      };
      window.addEventListener('beforeunload', unloadListener, {
        capture: true,
      });

      return () => {
        window.removeEventListener('beforeunload', unloadListener);
        unblock();
      };
    }
  }, [xform, formTouched, history, lang]);

  useEffect(() => {
    if (!loading && status.type !== 'saving') {
      let msg = t.t(lang, (s) => s.routes.operations.forms.status[status.type]);
      if (status.type === 'error') {
        toast.error(`${msg} ${status.message}`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else if (status.type === 'conflict') {
        const timeAgo = dayjs(status.timestamp).locale(lang);
        msg = t
          .t(lang, (s) => s.routes.operations.forms.errors.conflict)
          .replace('{timeAgo}', timeAgo.fromNow())
          .replace('{person}', status.otherPerson);
        toast.error(msg, { position: toast.POSITION.TOP_RIGHT });
      } else {
        if (!xform?.isCurrentPageTheFirstPage()) {
          toast.success(msg, { position: toast.POSITION.TOP_RIGHT });
        }
      }
    }
  }, [loading, status]);

  const saveForm = async (redirect = false, finalized = false) => {
    if (xform && (formTouched || finalized)) {
      setStatus({ type: 'saving' });
      setTimeout(async () => {
        const t0 = performance.now();
        const { data, files } = xform.getData();
        const t1 = performance.now();
        console.log('getData time: ' + (t1 - t0) + 'ms');

        if (lastSavedData !== data || finalized) {
          const {
            task: { form },
          } = assignment;

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
              setFormTouched(false);
              setStatus({ type: 'idle' });
              if (redirect) {
                history.goBack();
              }
            })
            .catch((err) => {
              if (errors.isConflictError(err)) {
                const timeAgo = dayjs(err.timestamp).locale(lang);
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
      });
    }
  };

  const handleNext = () => {
    if (xform) {
      // Allow enketo to flip the page
      setTimeout(() => {
        setLastPage(xform.isCurrentPageTheLastPage());
      }, 200);
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
        {loading ? (
          <>
            <span>
              {t.t(lang, (s) => s.routes.operations.forms.status.init)}
            </span>
            <CircularProgress size={20} />
          </>
        ) : !editable ? (
          t.t(lang, (s) => s.common.nonEditable)
        ) : status.type === 'idle' ? (
          t.t(
            lang,
            (s) =>
              s.routes.operations.forms.status[
                formTouched ? 'unsavedChanges' : 'idle'
              ]
          )
        ) : status.type === 'saving' ? (
          <>
            <span>
              {t.t(lang, (s) => s.routes.operations.forms.status[status.type])}
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

  return (
    <div>
      <C.Toolbar>
        <div className={CLASSES.FLEX.GROW} />
        {indicator()}
      </C.Toolbar>
      <div className="enketo" id="form">
        <div className="main" style={{ display: loading ? 'none' : 'block' }}>
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
                {editable && lastPage && <SubmitButton saveForm={saveForm} />}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
