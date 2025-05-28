import { type reportingWindows, errors } from '@unocha/hpc-data';
import { styled } from '@unocha/hpc-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import dayjs from '../../../libraries/dayjs';

import { toast } from 'react-toastify';
import { t } from '../../../i18n';
import { AppContext, getEnv } from '../../context';
import usePrompt from '../../utils/usePrompt';
import FormToolbar from './formToolbar';
import AssignedUsersModal from './modals/assignedUsersModal';
import ValidationOnNavigationModal from './modals/validationOnNavigationModal';
import ValidationOnSubmitModal from './modals/validationOnSubmitModal';
import PageIndicator from './pageIndicator';
import PoweredByFooter from './powered-by-footer';
import SubmitButton from './submit-button';
import { type FormStatus, type SubmissionValidation } from './types';
import XForm, { type PageInfo } from './xform';

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

export const EnketoEditableForm = (props: Props) => {
  const { assignment: originalAssignment, reportingWindow } = props;
  const env = getEnv();

  const [isLoading, setIsLoading] = useState(true);
  const xform = useRef<XForm | null>(null);

  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [lastSavedData, setLastSavedData] = useState<string | null>(null);
  const [isFormTouched, setIsFormTouched] = useState(false);
  const [updatedAssignment, setUpdatedAssignment] =
    useState<reportingWindows.GetAssignmentResult | null>(null);
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });
  const [isEditable, setIsEditable] = useState(true);
  const [
    shouldShowValidationConfirmation,
    setShouldShowValidationConfirmation,
  ] = useState(false);
  const [shouldShowAssignedUsers, setShouldShowAssignedUsers] = useState(false);
  const [submissionValidation, setSubmissionValidation] =
    useState<SubmissionValidation>(null);
  const navigate = useNavigate();
  const { lang } = useContext(AppContext);

  const assignment = updatedAssignment ?? originalAssignment;

  const isFormModified = !isLoading && xform !== null && isFormTouched;
  usePrompt(
    t.t(lang, (s) => s.routes.operations.forms.unsavedChangesPrompt),
    isFormModified
  );

  useEffect(() => {
    const unMount = () => {
      if (xform.current) {
        xform.current.resetView();
      }
      // Clears enketo cache or something going on there which slows down
      // form re-init/getData.
      navigate(0);
    };

    return () => {
      unMount();
    };
  }, [navigate]);

  useEffect(() => {
    let isSubscribed = true; // To cancel form initialization
    const {
      editable: isOriginalAssignmentEditable,
      task: {
        form: {
          definition: { form, model },
        },
        currentData,
        currentFiles,
      },
      state,
    } = originalAssignment;

    /**
     * Should the UI treat the assignment as editable?
     *
     * (The API will have editable as true if the user has edit access, but we
     * also want to prevent a user editing the form data if it's in a finalized
     * state, to prevent accidental changes)
     */
    const isEditable =
      state === 'clean:finalized' || state === 'raw:finalized'
        ? false
        : isOriginalAssignmentEditable;

    // Convert the ArrayBuffers to Blobs to use in the form
    const files = currentFiles.map((f) => ({
      name: f.name,
      data: new Blob([new Uint8Array(f.data)]),
    }));

    const _xform = new XForm(form, model, currentData, files, {
      onDataUpdate: () => {
        setIsFormTouched(true);
      },
      onPageFlip: ({ xform }) => {
        setPageInfo(xform.getPageInfo());
      },
    });
    const timer = setTimeout(() => {
      // Long running process, it could take up to 20 seconds
      // depending on number of embedded locations/sublocations.
      _xform.init(isEditable).then(() => {
        if (isSubscribed) {
          // User has abandoned this page
          xform.current = _xform;
          setIsEditable(isEditable);
          setUpdatedAssignment(null);
          setIsLoading(false);
          setPageInfo(_xform.getPageInfo());
        }
      });
    });
    return () => {
      clearTimeout(timer);
      isSubscribed = false;
      setIsLoading(false);
    };
  }, [originalAssignment]);

  const handleNext = async () => {
    if (xform.current) {
      if (isEditable) {
        const isValid = await xform.current.validateCurrentPage();
        if (isValid) {
          xform.current.goToNextPage();
        } else {
          setShouldShowValidationConfirmation(true);
        }
      } else {
        xform.current.goToNextPage();
      }
    }
    // Save form after advancing to the next page
    setTimeout(() => saveForm(), 0);
  };

  const forceNextPage = () => {
    if (xform.current) {
      xform.current.goToNextPage();
      setShouldShowValidationConfirmation(false);
    }
  };

  const saveForm = async (redirect = false, finalized = false) => {
    if (xform.current && (isFormTouched || finalized)) {
      // If the user is trying to finalize (submit) the form
      // Ensure the entire form is valid
      if (finalized) {
        // Display a validating indicator before enketo freezes the browser
        setSubmissionValidation('in-progress');
        // Give the browser some time to render this state change
        await new Promise((resolve) => setTimeout(resolve, 10));

        const isValid = await xform.current.validateEverything();
        if (!isValid) {
          // If the form is invalid, we don't want to submit it
          // But we can still save it.
          saveForm();
          setSubmissionValidation('invalid');
          return;
        }
        setSubmissionValidation(null);
      }

      setStatus({ type: 'saving' });
      setTimeout(async () => {
        if (!xform.current) {
          return;
        }

        const t0 = performance.now();
        const { data, files } = xform.current.getData();
        const t1 = performance.now();
        console.log(`getData time: ${t1 - t0}ms`);

        if (lastSavedData !== data || finalized) {
          const {
            id,
            task: { form, currentData },
            version,
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
              assignmentId: id,
              previousVersion: version,
              form: {
                id: form.id,
                version: form.version,
                data,
                files: convertedFiles,
                finalized,
              },
            })
            .then((assignment) => {
              setLastSavedData(currentData);
              setUpdatedAssignment(assignment);
              setIsFormTouched(false);
              setStatus({ type: 'idle' });
              const msg = t.t(
                lang,
                (s) => s.routes.operations.forms.status.idle
              );
              toast.success(msg, { position: 'top-right' });
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
                navigate(-1);
              }
            })
            .catch((error) => {
              if (errors.isConflictError(error)) {
                const timeAgo = dayjs(error.timestamp).locale(lang);
                alert(
                  t
                    .t(lang, (s) => s.routes.operations.forms.errors.conflict)
                    .replace('{timeAgo}', timeAgo.fromNow())
                    .replace('{person}', error.otherUser)
                );
                setStatus({
                  type: 'conflict',
                  timestamp: error.timestamp,
                  otherPerson: error.otherUser,
                });
                const msg = t
                  .t(lang, (s) => s.routes.operations.forms.errors.conflict)
                  .replace('{timeAgo}', timeAgo.fromNow())
                  .replace('{person}', error.otherUser);
                toast.error(msg, { position: 'top-right' });
              } else {
                setStatus({
                  type: 'error',
                  message: error.message ?? error.toString(),
                });
                const msg = t.t(
                  lang,
                  (s) => s.routes.operations.forms.status.error
                );
                toast.error(`${msg} ${error.message ?? error.toString()}`, {
                  position: 'top-right',
                });
              }
            });
        }
      });
    } else if (redirect) {
      alert(
        t.t(lang, (s) => s.routes.operations.forms.prompts.submissionRequired)
      );
      navigate(-1);
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
    isLoading,
    isEditable,
    reportingWindow,
    assignment,
    setShouldShowAssignedUsers,
    isFormTouched,
    status,
    setStatus,
  };
  return (
    <div>
      <FormToolbar {...formToolBarProps} />
      {isLoading && (
        <LoadingMessage>
          <h3>{t.t(lang, (s) => s.routes.operations.forms.loading.title)}</h3>
          <p>{t.t(lang, (s) => s.routes.operations.forms.loading.info)}</p>
        </LoadingMessage>
      )}
      <div className="enketo" id="form" onClick={captureLinkClicks}>
        <PageIndicator pageInfo={pageInfo} />
        <div className="main" style={{ display: isLoading ? 'none' : 'block' }}>
          <div className="container pages"></div>
          <section className="form-footer end">
            <div className="form-footer__content">
              <PageIndicator pageInfo={pageInfo} />
              <div className="form-footer__content__main-controls">
                <button className="btn btn-default previous-page disabled">
                  {t.t(lang, (s) => s.routes.operations.forms.nav.prev)}
                </button>
                {isEditable && (
                  <button
                    onClick={() => saveForm()}
                    className="btn btn-default"
                    style={{ display: 'inline-block' }}
                  >
                    {t.t(lang, (s) => s.routes.operations.forms.nav.save)}
                  </button>
                )}
                {isEditable && pageInfo?.isLastPage && (
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
                {isEditable && pageInfo?.isLastPage && (
                  <SubmitButton
                    isValidating={submissionValidation === 'in-progress'}
                    saveForm={saveForm}
                  />
                )}
              </div>
            </div>
            <ValidationOnNavigationModal
              nextPage={forceNextPage}
              shouldShowValidationConfirmation={
                shouldShowValidationConfirmation
              }
              closeValidationMessage={() =>
                setShouldShowValidationConfirmation(false)
              }
            />
            <ValidationOnSubmitModal
              submissionValidation={submissionValidation}
              closeInvalidSubmissionMessage={() =>
                setSubmissionValidation(null)
              }
            />
            <AssignedUsersModal
              shouldShowAssignedUsers={shouldShowAssignedUsers}
              closeAssignedUsers={() => setShouldShowAssignedUsers(false)}
              assignment={assignment}
            />
            <PoweredByFooter />
          </section>
        </div>
      </div>
    </div>
  );
};
