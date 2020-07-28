import React from 'react';

import { t } from '../../i18n';
import { C, dataLoader } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

import FormAssignmentsList from './form-assignments-list';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  window: reportingWindows.ReportingWindow;
}

const OperationFormAssignmentsList = (props: Props) => {
  const { operation, window } = props;
  const env = getEnv();

  const loader = dataLoader(
    [
      {
        reportingWindowId: window.id,
        operationId: operation.id,
      },
    ],
    ({ reportingWindowId, operationId }) =>
      Promise.all([
        env.model.reportingWindows.getAssignmentsForOperation({
          reportingWindowId,
          operationId,
        }),
        env.model.operations.getClusters({ operationId }),
      ])
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
          {([assignments, clusters]) => {
            const operationAssignments = assignments.directAssignments.forms;
            const clusterPrefixes = new Map<number, string>();
            for (const cluster of clusters.data) {
              clusterPrefixes.set(cluster.id, cluster.name);
            }
            const clusterAssignments = assignments.clusterAssignments
              .map((cluster) =>
                cluster.forms.map((assignment) => ({
                  ...assignment,
                  prefix: clusterPrefixes.get(cluster.clusterId),
                }))
              )
              .reduce((acc, val) => acc.concat(val), []);
            return (
              <div>
                <h3>
                  {t.t(lang, (s) => s.routes.operations.forms.forOperations)}
                </h3>
                <FormAssignmentsList
                  assignments={operationAssignments}
                  assignmentLink={(a) =>
                    paths.operationFormAssignmentData({
                      operationId: operation.id,
                      windowId: window.id,
                      assignmentId: a.assignmentId,
                    })
                  }
                />
                <h3>
                  {t.t(lang, (s) => s.routes.operations.forms.forClusters)}
                </h3>
                <FormAssignmentsList
                  assignments={clusterAssignments}
                  assignmentLink={(a) =>
                    paths.operationFormAssignmentData({
                      operationId: operation.id,
                      windowId: window.id,
                      assignmentId: a.assignmentId,
                    })
                  }
                />
              </div>
            );
          }}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default OperationFormAssignmentsList;
