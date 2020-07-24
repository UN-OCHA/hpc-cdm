import React from 'react';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  window: reportingWindows.ReportingWindow;
}

const Page = (props: Props) => {
  const { operation, window } = props;

  const loader = dataLoader(
    [
      {
        reportingWindowId: window.id,
        operationId: operation.id,
      },
    ],
    env.model.reportingWindows.getAssignmentsForOperation
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
            <ul>
              {data.directAssignments.forms.map((a, i) => (
                <li key={i}>{a.form.name}</li>
              ))}
            </ul>
          )}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Page)``;
