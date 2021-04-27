import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { reportingWindows, errors } from '@unocha/hpc-data';
import { styled } from '@unocha/hpc-ui';

import dayjs from '../../../libraries/dayjs';

import XForm, { PageInfo } from './xform';
import { getEnv, AppContext } from '../../context';
import { t } from '../../../i18n';
import SubmitButton from './submit-button';
import { toast } from 'react-toastify';
import PageIndicator from './pageIndicator';
import PoweredByFooter from './powered-by-footer';
import { FormStatus, SubmissionValidation } from './types';
import FormToolbar from './formToolbar';
import ValidationOnNavigationModal from './modals/validationOnNavigationModal';
import ValidationOnSubmitModal from './modals/validationOnSubmitModal';
import AssignedUsersModal from './modals/assignedUsersModal';

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

interface Props {
  reportingWindow: reportingWindows.ReportingWindow;
  assignment: reportingWindows.GetAssignmentResult;
}

let isRefreshing = false;

export const EnketoEditableForm = (props: Props) => {
  const { assignment: originalAssignment } = props;
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
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });
  const [editable, setEditable] = useState(true);
  const [showValidationConfirmation, setShowValidationConfirmation] = useState(
    false
  );
  const [showAssignedUsers, setShowAssignedUsers] = useState(false);
  const [submissionValidation, setSubmissionValidation] = useState<
    SubmissionValidation
  >(null);
  const history = useHistory();
  const { lang } = useContext(AppContext);

  const assignment = updatedAssignment || originalAssignment;

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

  const forceNextPage = () => {
    if (xform) {
      xform.goToNextPage();
      setShowValidationConfirmation(false);
    }
  };

  const saveForm = async (redirect = false, finalized = false) => {
    if (xform && (formTouched || finalized)) {
      // If the user is trying to finalize (submit) the form
      // Ensure the entire form is valid
      if (finalized) {
        // Display a validating inicator before enketo freezes the browser
        setSubmissionValidation('in-progress');
        // Give the browser some time to render this state change
        await new Promise((resolve) => setTimeout(resolve, 10));

        const valid = await xform.validateEverything();
        if (!valid) {
          // If the form is invalid, we don't want to submit it
          // But we can still save it.
          saveForm();
          setSubmissionValidation('invalid');
          return;
        } else {
          setSubmissionValidation(null);
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

  /**
   * Ensure that all link clicks open in a new tab
   */
  const captureLinkClicks = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target instanceof HTMLAnchorElement && e.target.href) {
      e.target.target = '_blank';
      e.target.rel = 'noopener noreferrer';
    }
  };

  const formToolBarProps = {
    loading,
    assignment,
    setShowAssignedUsers,
    formTouched,
    formStatus: status,
    setStatus,
  };
  return (
    <div>
      <FormToolbar {...formToolBarProps} />
      {loading && (
        <LoadingMessage>
          <h3>{t.t(lang, (s) => s.routes.operations.forms.loading.title)}</h3>
          <p>{t.t(lang, (s) => s.routes.operations.forms.loading.info)}</p>
        </LoadingMessage>
      )}
      <div className="enketo" id="form" onClick={captureLinkClicks}>
        <PageIndicator pageInfo={pageInfo} />
        <div className="main" style={{ display: loading ? 'none' : 'block' }}>
          <div className="container pages"></div>
          <section className="form-footer end">
            <div className="form-footer__content">
              <PageIndicator pageInfo={pageInfo} />
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
                  <SubmitButton
                    validating={submissionValidation === 'in-progress'}
                    saveForm={saveForm}
                  />
                )}
              </div>
            </div>
            <ValidationOnNavigationModal
              nextPage={forceNextPage}
              showValidationConfirmation={showValidationConfirmation}
              closeValidationMessage={() =>
                setShowValidationConfirmation(false)
              }
            />
            <ValidationOnSubmitModal
              submissionValidation={submissionValidation}
              closeInvalidSubmissionMessage={() =>
                setSubmissionValidation(null)
              }
            />
            <AssignedUsersModal
              showAssignedUsers={showAssignedUsers}
              closeAssignedUsers={() => setShowAssignedUsers(false)}
              assignment={assignment}
            />
            <PoweredByFooter />
          </section>
        </div>
      </div>
    </div>
  );
};
