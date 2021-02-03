import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { reportingWindows, errors } from '@unocha/hpc-data';
import { C, CLASSES, styled } from '@unocha/hpc-ui';
import {
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@material-ui/core';
import { MdWarning, MdLock, MdLockOpen } from 'react-icons/md';
import dayjs from '../../../libraries/dayjs';

import XForm, { PageInfo } from './xform';
import { getEnv, AppContext } from '../../context';
import { t } from '../../../i18n';
import SubmitButton from './submit-button';
import { toast } from 'react-toastify';
import PoweredByFooter from './powered-by-footer';

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

const LoadingMessage = styled.div`
  margin: 0 ${(p) => p.theme.marginPx.md};
  text-align: center;

  h3 {
    font-size: 2.5rem;
  }

  p {
    font-size: 2rem;
  }
`;

const PageIndicator = styled.div`
  text-align: center;
  font-weight: bold;
  margin-bottom: ${(p) => p.theme.marginPx.md}px;
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

let isRefreshing = false;

export const EnketoEditableForm = (props: Props) => {
  const { reportingWindow, assignment: originalAssignment } = props;
  const env = getEnv();

  const [loading, setLoading] = useState(true);
  const [xform, setXform] = useState<XForm | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [lastSavedData, setLastSavedData] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState(false);
  const [
    updatedAssignment,
    setUpdatedAssignment,
  ] = useState<reportingWindows.GetAssignmentResult | null>(null);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [editable, setEditable] = useState(true);
  const [showValidationConfirmation, setShowValidationConfirmation] = useState(
    false
  );
  const [
    showInvalidSubmissionMessage,
    setShowInvalidSubmissionMessage,
  ] = useState(false);
  const history = useHistory();
  const { lang } = useContext(AppContext);

  const assignment = updatedAssignment || originalAssignment;

  const lastUpdatedAt = dayjs(
    status.type === 'conflict' ? status.timestamp : assignment.lastUpdatedAt
  ).locale(lang);
  const lastUpdatedBy =
    status.type === 'conflict' ? status.otherPerson : assignment.lastUpdatedBy;

  const unMount = () => {
    isRefreshing = true;
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
      onDataUpdate: ({ xform }) => {
        setFormTouched(true);
      },
      onPageFlip: ({ xform }) => {
        setPageInfo(xform.getPageInfo());
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
          setPageInfo(xform.getPageInfo());
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
    //only run if there's changes
    if (!loading && xform && formTouched) {
      // React router in app navigation blocking displays custom text
      const unblock = history.block(() => {
        return t.t(lang, (s) => s.routes.operations.forms.unsavedChangesPrompt);
      });

      // Browser api navigation blocking returns default text
      const unloadListener = (event: BeforeUnloadEvent) => {
        if (!isRefreshing) {
          event.preventDefault();
          event.returnValue = ''; // Chrome requires returnValue to be set.
        }
      };

      window.addEventListener('beforeunload', unloadListener);
      return () => {
        window.removeEventListener('beforeunload', unloadListener);
        unblock();
      };
    }
  }, [xform, formTouched, history, lang]);

  const handleNext = async () => {
    if (xform) {
      if (editable) {
        const valid = await xform.validateCurrentPage();
        if (valid) {
          xform.goToNextPage();
        } else {
          setShowValidationConfirmation(true);
        }
      } else {
        xform.goToNextPage();
      }
    }
    // Save form after advancing to the next page
    setTimeout(() => saveForm(), 0);
  };

  const closeValidationMessage = () => {
    setShowValidationConfirmation(false);
  };

  const forceNextPage = () => {
    if (xform) {
      xform.goToNextPage();
      setShowValidationConfirmation(false);
    }
  };

  const closeInvalidSubmissionMessage = () => {
    setShowInvalidSubmissionMessage(false);
  };

  const saveForm = async (redirect = false, finalized = false) => {
    if (xform && (formTouched || finalized)) {
      // If the user is trying to finalize (submit) the form
      // Ensure the entire form is valid
      if (finalized) {
        const valid = await xform.validateEverything();
        if (!valid) {
          // If the form is invalid, we don't want to submit it
          // But we can still save it.
          saveForm();
          setShowInvalidSubmissionMessage(true);
          return;
        }
      }

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
              const msg = t.t(
                lang,
                (s) => s.routes.operations.forms.status.idle
              );
              toast.success(msg, { position: toast.POSITION.TOP_RIGHT });
              if (redirect) {
                if (finalized) {
                  alert(
                    t.t(lang, (s) => s.routes.operations.forms.prompts.finished)
                  );
                } else {
                  alert(
                    t.t(
                      lang,
                      (s) =>
                        s.routes.operations.forms.prompts.submissionRequired
                    )
                  );
                }
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
                const msg = t
                  .t(lang, (s) => s.routes.operations.forms.errors.conflict)
                  .replace('{timeAgo}', timeAgo.fromNow())
                  .replace('{person}', err.otherUser);
                toast.error(msg, { position: toast.POSITION.TOP_RIGHT });
              } else {
                setStatus({
                  type: 'error',
                  message: err.message || err.toString(),
                });
                const msg = t.t(
                  lang,
                  (s) => s.routes.operations.forms.status.error
                );
                toast.error(`${msg} ${err.message || err.toString()}`, {
                  position: toast.POSITION.TOP_RIGHT,
                });
              }
            });
        }
      });
    } else if (redirect) {
      alert(
        t.t(lang, (s) => s.routes.operations.forms.prompts.submissionRequired)
      );
      history.goBack();
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
                {t.t(
                  lang,
                  (s) =>
                    s.routes.operations.forms.editability.notSubmittedEditable
                )}
              </NotSubmitted>
            )}
            {editable && (
              <span>
                {status.type === 'idle' ? (
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
                ) : status.type === 'saving' ? (
                  <>
                    <span>
                      {t.t(
                        lang,
                        (s) => s.routes.operations.forms.status[status.type]
                      )}
                    </span>
                    <CircularProgress size={20} />
                  </>
                ) : (
                  <>
                    <span>
                      {t.t(
                        lang,
                        (s) => s.routes.operations.forms.status[status.type]
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

  /**
   * Ensure that all link clicks open in a new tab
   */
  const captureLinkClicks = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target instanceof HTMLAnchorElement && e.target.href) {
      e.target.target = '_blank';
      e.target.rel = 'noopener noreferrer';
    }
  };

  const pageIndicator = pageInfo && (
    <PageIndicator>
      {t.t(lang, (s) => s.routes.operations.forms.pageIndicator, {
        page: (pageInfo.currentPage || 0) + 1,
        count: pageInfo.totalPages,
      })}
    </PageIndicator>
  );

  return (
    <div>
      <C.Toolbar>
        <div className={CLASSES.FLEX.GROW} />
        {indicator()}
      </C.Toolbar>
      {loading && (
        <LoadingMessage>
          <h3>{t.t(lang, (s) => s.routes.operations.forms.loading.title)}</h3>
          <p>{t.t(lang, (s) => s.routes.operations.forms.loading.info)}</p>
        </LoadingMessage>
      )}
      <div className="enketo" id="form" onClick={captureLinkClicks}>
        {pageIndicator}
        <div className="main" style={{ display: loading ? 'none' : 'block' }}>
          <div className="container pages"></div>
          <section className="form-footer end">
            <div className="form-footer__content">
              {pageIndicator}
              <div className="form-footer__content__main-controls">
                <button className="btn btn-default previous-page disabled">
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
                {editable && pageInfo?.isLastPage && (
                  <button
                    onClick={() => saveForm(true)}
                    className="btn btn-default"
                    style={{ display: 'inline-block' }}
                  >
                    {t.t(
                      lang,
                      (s) => s.routes.operations.forms.nav.saveAndClose
                    )}
                  </button>
                )}
                {!pageInfo?.isLastPage && (
                  <button onClick={handleNext} className="btn btn-primary">
                    {t.t(lang, (s) => s.routes.operations.forms.nav.next)}
                  </button>
                )}
                {editable && pageInfo?.isLastPage && (
                  <SubmitButton saveForm={saveForm} />
                )}
              </div>
            </div>
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
                    (s) =>
                      s.routes.operations.forms.invalidData.infoOnNavigation
                  )}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  onClick={closeValidationMessage}
                  color="primary"
                  autoFocus
                >
                  {t.t(
                    lang,
                    (s) => s.routes.operations.forms.invalidData.fixNow
                  )}
                </Button>
                <Button onClick={forceNextPage} color="primary">
                  {t.t(
                    lang,
                    (s) => s.routes.operations.forms.invalidData.fixLater
                  )}
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={showInvalidSubmissionMessage}
              onClose={closeInvalidSubmissionMessage}
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
                    (s) => s.routes.operations.forms.invalidData.infoOnSubmit
                  )}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  onClick={closeInvalidSubmissionMessage}
                  color="primary"
                  autoFocus
                >
                  {t.t(lang, (s) => s.routes.operations.forms.invalidData.okay)}
                </Button>
              </DialogActions>
            </Dialog>
            <PoweredByFooter />
          </section>
        </div>
      </div>
    </div>
  );
};
