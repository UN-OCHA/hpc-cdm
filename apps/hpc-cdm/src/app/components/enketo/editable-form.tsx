import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import XForm from './xform';
import { Types } from './reducer';
import { EnketoFormContext } from './context';
import { getEnv } from '../../context';
import isEqual from 'lodash/isEqual';

export const EnketoEditableForm = () => {
  const env = getEnv();
  const { state, dispatch } = useContext(EnketoFormContext);
  const history = useHistory();
  const dataUpdated = (data: any) => {
    if (state.assignment) {
      const {
        assignment: {
          task: { currentData },
        },
      } = state;
      return !isEqual(currentData, data);
    }
    return false;
  };

  useEffect(() => {
    if (state.assignment) {
      const {
        task: {
          form: {
            definition: { form, model },
          },
          currentData,
          currentFiles,
        },
      } = state.assignment;
      const xform = new XForm(form, model, currentData, currentFiles);
      dispatch({ type: Types.UpdateXForm, payload: { xform } });
    }
  }, [state.assignment]);

  const saveForm = (redirect = false) => {
    const { reportingWindowId, assignment, xform } = state;
    if (reportingWindowId !== undefined && assignment && xform) {
      const data = xform.getData();
      if (data && dataUpdated(data)) {
        const {
          id,
          task: { form },
        } = assignment;
        return env.model.reportingWindows
          .updateAssignment({
            reportingWindowId,
            assignmentId: id,
            form: {
              id: form.id,
              version: form.version,
              data,
              files: xform.getFiles(),
              blobs: xform.getBlobs(),
            },
          })
          .then(({ task: { currentData } }) => {
            dispatch({
              type: Types.UpdateData,
              payload: { data: currentData },
            });
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
