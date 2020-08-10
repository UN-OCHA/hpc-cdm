import React, { useContext, useEffect, useState } from 'react';
import { EnketoFormStyle } from './style';
import XForm from './xform';
import { Types } from './reducer';
import { EnketoFormContext, EnketoFormContextProvider } from './context';
import { getEnv } from '../../context';
import isEqual from 'lodash/isEqual';

const EnketoEditableForm = () => {
  const env = getEnv();
  const { state, dispatch } = useContext(EnketoFormContext);
  const [xform, setXForm] = useState<XForm | undefined>(undefined);
  const dataUpdated = (data: any) => !isEqual(state.data, data);

  useEffect(() => {
    if (state.form) {
      const {
        definition: {
          default: { form, model },
        },
      } = state.form;
      const { data } = state;
      console.log(data);
      // const data = submission && submission.data ? submission.data : {};
      setXForm(new XForm(form, model, data || {}));
    }
  }, [state.form]);

  const handleNextPage = () => {
    if (state.form && xform) {
      const data = xform.getData();
      if (dataUpdated(data)) {
        console.log('updating......................');
        const { id, version } = state.form;
        env.model.forms
          .addFormSubmission({ id, version, data })
          .then(({ data }) => {
            dispatch({ type: Types.UpdateData, payload: { data } });
          });
      }
    }
  };

  const handleSubmit = () => {
    if (xform) {
      const data = xform.getData();
      dispatch({ type: Types.UpdateData, payload: { data } });
    }
  };

  return (
    <EnketoFormStyle>
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
                  onMouseDown={handleNextPage}
                  className="btn btn-primary next-page disabled"
                >
                  Next
                </button>
                <button
                  onClick={handleSubmit}
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
    </EnketoFormStyle>
  );
};

export { EnketoFormContextProvider, EnketoEditableForm };
