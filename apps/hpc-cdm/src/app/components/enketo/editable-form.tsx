import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { reportingWindows } from '@unocha/hpc-data';

import XForm from './xform';
import { getEnv } from '../../context';

interface Props {
  reportingWindow: reportingWindows.ReportingWindow;
  assignment: reportingWindows.GetAssignmentResult;
}

export const EnketoEditableForm = (props: Props) => {
  const { reportingWindow, assignment } = props;
  const env = getEnv();
  const [xform, setXform] = useState<XForm | null>(null);
  const [lastSavedData, setLastSavedData] = useState<string | null>(null);
  const history = useHistory();

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
    setLastSavedData(currentData);
  }, [assignment]);

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
    <div className="enketo" id="form">
      <div className="main">
        <div className="container pages"></div>
        <section className="form-footer end">
          <div className="form-footer__content">
            <div className="form-footer__content__main-controls">
              <button className="btn btn-default previous-page disabled">
                Prev
              </button>
              <button
                onMouseDown={() => saveForm()}
                className="btn btn-primary next-page disabled"
              >
                Next
              </button>
              <button
                onClick={() => saveForm(true)}
                className="btn btn-primary"
                id="submit-form"
              >
                <i className="icon icon-check"> </i>Submit
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
