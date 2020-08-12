import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import XForm from './xform';
import { Types } from './reducer';
import { EnketoFormContext } from './context';
import { getEnv } from '../../context';
import isEqual from 'lodash/isEqual';

export const EnketoEditableForm = () => {
  const env = getEnv();
  const { state, dispatch } = useContext(EnketoFormContext);
  const [xform, setXForm] = useState<XForm | undefined>(undefined);
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
            definition: {
              default: { form, model },
            },
          },
          currentData,
          currentFiles,
        },
      } = state.assignment;
      setXForm(new XForm(form, model, currentData || {}, currentFiles));
    }
  }, [state.assignment]);

  const saveForm = (redirect = false) => {
    if (state.reportingWindowId !== undefined && state.assignment && xform) {
      const data = xform.getData();
      if (data && dataUpdated(data)) {
        const {
          reportingWindowId,
          assignment: {
            id,
            task: { form },
          },
        } = state;
        return env.model.reportingWindows
          .updateAssignment({
            reportingWindowId,
            assignmentId: id,
            form: {
              id: form.id,
              version: form.version,
              data,
              blobs: xform.getCurrentFiles(),
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
