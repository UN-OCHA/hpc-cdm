import React from 'react';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';
import * as paths from '../paths';

import FormAssignmentsList from './form-assignments-list';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  window: reportingWindows.ReportingWindow;
}

const OperationFormAssignmentsList = (props: Props) => {
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
            <FormAssignmentsList
              assignments={data.directAssignments.forms}
              assignmentLink={(a) =>
                paths.operationFormAssignmentData({
                  operationId: operation.id,
                  windowId: window.id,
                  assignmentId: a.assignmentId,
                })
              }
            />
          )}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default styled(OperationFormAssignmentsList)``;
