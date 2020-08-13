import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { reportingWindows } from '@unocha/hpc-data';
import { BreadcrumbLinks, C } from '@unocha/hpc-ui';

import XForm from './xform';
import { getEnv, AppContext } from '../../context';
import { t } from '../../../i18n';

interface Props {
  reportingWindow: reportingWindows.ReportingWindow;
  assignment: reportingWindows.GetAssignmentResult;
  breadcrumbs: BreadcrumbLinks;
}

export const EnketoEditableForm = (props: Props) => {
  const { breadcrumbs, reportingWindow, assignment } = props;
  const env = getEnv();
  const [xform, setXform] = useState<XForm | null>(null);
  const [lastSavedData, setLastSavedData] = useState<string | null>(null);
  const history = useHistory();
  const { lang } = useContext(AppContext);

  useEffect(() => {
    const {
      task: {
        form: {
          definition: { form, model },
        },
        currentData,
        currentFiles,
      },
    } = assignment;
    const xform = new XForm(form, model, currentData, currentFiles);
    setXform(xform);
    setLastSavedData(xform.getData().data);
  }, [assignment]);

  useEffect(() => {
    // Setup listeners to prevent navigating away when the form has changed

    const unblock = history.block(() => {
      if (xform) {
        const { data } = xform.getData();
        if (data && lastSavedData !== data) {
          return t.t(
            lang,
            (s) => s.routes.operations.forms.unsavedChangesPrompt
          );
        }
      }
    });

    const unloadListener = (event: BeforeUnloadEvent) => {
      if (xform) {
        const { data } = xform.getData();
        console.log(!!data, lastSavedData !== data);
        if (data && lastSavedData !== data) {
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

  const saveForm = (redirect = false) => {
    if (xform) {
      const { data, files } = xform.getData();
      if (data && lastSavedData !== data) {
        const {
          id,
          task: { form },
        } = assignment;
        return env.model.reportingWindows
          .updateAssignment({
            reportingWindowId: reportingWindow.id,
            assignmentId: id,
            form: {
              id: form.id,
              version: form.version,
              data,
              files,
            },
          })
          .then(({ task: { currentData } }) => {
            setLastSavedData(currentData);
            if (redirect) {
              history.goBack();
            }
          });
      }
    }
  };

  return (
    <div>
      <C.Toolbar>
        <C.Breadcrumbs links={breadcrumbs} />
      </C.Toolbar>
      <div className="enketo" id="form">
        <div className="main">
          <div className="container pages"></div>
          <section className="form-footer end">
            <div className="form-footer__content">
              <div className="form-footer__content__main-controls">
                <button className="btn btn-default previous-page disabled">
                  {t.t(lang, (s) => s.routes.operations.forms.nav.prev)}
                </button>
                <button
                  onClick={() => saveForm()}
                  className="btn btn-default"
                  style={{ display: 'inline-block' }}
                >
                  {t.t(lang, (s) => s.routes.operations.forms.nav.save)}
                </button>
                <button
                  onMouseDown={() => saveForm()}
                  className="btn btn-primary next-page disabled"
                >
                  {t.t(lang, (s) => s.routes.operations.forms.nav.next)}
                </button>
                <button
                  onClick={() => saveForm(true)}
                  className="btn btn-primary"
                  id="submit-form"
                >
                  <i className="icon icon-check"> </i>
                  {t.t(lang, (s) => s.routes.operations.forms.nav.submit)}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
