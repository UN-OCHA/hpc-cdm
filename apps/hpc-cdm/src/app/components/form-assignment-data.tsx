import React from 'react';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';

interface Props {
  className?: string;
  window: reportingWindows.ReportingWindow;
  assignmentId: number;
}

const FormAssignmentData = (props: Props) => {
  const { window, assignmentId } = props;

  const loader = dataLoader(
    [
      {
        assignmentId,
        reportingWindowId: window.id,
      },
    ],
    env.model.reportingWindows.getAssignment
  );

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <C.Loader
          loader={loader}
          strings={{
            ...t.get(lang, (s) => s.components.loader),
            notFound: t.get(lang, (s) => s.components.notFound),
          }}
        >
          {(data) => (
            <div>
              <p>
                <strong>Form: </strong>
                {data.task.form.name}
              </p>
              <p>
                <strong>Definition: </strong>
                <input disabled type="text" value={data.task.form.definition} />
              </p>
              <p>
                <strong>Data: </strong>
                <input type="text" value={data.task.currentData} />
              </p>
            </div>
          )}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default styled(FormAssignmentData)``;
