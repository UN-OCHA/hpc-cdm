import React from 'react';

import { t } from '../../i18n';
import { C, dataLoader, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

import FormAssignmentsList from './form-assignments-list';

const CLS = {
  CLUSTER_FORM_LIST: 'cluster-forms',
};

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  window: reportingWindows.ReportingWindow;
}

const Container = styled.div`
  > .${CLS.CLUSTER_FORM_LIST} {
    margin-top: ${(p) => p.theme.marginPx.lg}px;
  }
`;

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
            const clusterNames = new Map<number, string>();
            for (const cluster of clusters.data) {
              clusterNames.set(cluster.id, cluster.name);
            }
            const clusterAssignments = assignments.clusterAssignments
              .map((cluster) =>
                cluster.forms.map((assignment) => {
                  const name = clusterNames.get(cluster.clusterId);
                  return {
                    ...assignment,
                    cluster: name ? { name } : undefined,
                  };
                })
              )
              .reduce((acc, val) => acc.concat(val), []);
            return (
              <Container>
                {operationAssignments.length > 0 && (
                  <FormAssignmentsList
                    title={t.t(
                      lang,
                      (s) => s.routes.operations.forms.forOperations
                    )}
                    assignments={operationAssignments}
                    assignmentLink={(a) =>
                      paths.operationFormAssignmentData({
                        operationId: operation.id,
                        windowId: window.id,
                        assignmentId: a.assignmentId,
                      })
                    }
                  />
                )}
                {clusterAssignments.length > 0 && (
                  <FormAssignmentsList
                    className={CLS.CLUSTER_FORM_LIST}
                    title={t.t(
                      lang,
                      (s) => s.routes.operations.forms.forClusters
                    )}
                    assignments={clusterAssignments}
                    assignmentLink={(a) =>
                      paths.operationFormAssignmentData({
                        operationId: operation.id,
                        windowId: window.id,
                        assignmentId: a.assignmentId,
                      })
                    }
                  />
                )}
              </Container>
            );
          }}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default OperationFormAssignmentsList;
