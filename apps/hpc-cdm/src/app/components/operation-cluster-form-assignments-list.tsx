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
  cluster: operations.OperationCluster;
  window: reportingWindows.ReportingWindow;
}

const OperationClusterFormAssignmentsList = (props: Props) => {
  const { operation, window, cluster } = props;

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
          {(data) => {
            const forms =
              data.clusterAssignments.filter(
                (ca) => ca.clusterId === cluster.id
              )[0]?.forms || [];
            return (
              <FormAssignmentsList
                assignments={forms}
                assignmentLink={(a) =>
                  paths.operationClusterFormAssignmentData({
                    operationId: operation.id,
                    clusterId: cluster.id,
                    windowId: window.id,
                    assignmentId: a.assignmentId,
                  })
                }
              />
            );
          }}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default styled(OperationClusterFormAssignmentsList)``;
