import React from 'react';
import { MdCheckCircle } from 'react-icons/md';

import { t } from '../../i18n';
import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

import FormAssignmentsList from './form-assignments-list';

const Container = styled.div``;

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
    getEnv().model.reportingWindows.getAssignmentsForOperation
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
            return forms.length === 0 ? (
              <C.ErrorMessage
                icon={MdCheckCircle}
                strings={t.get(
                  lang,
                  (s) => s.routes.operations.clusters.forms.none
                )}
              />
            ) : (
              <Container>
                <FormAssignmentsList
                  title={t.t(
                    lang,
                    (s) => s.routes.operations.forms.forClusters
                  )}
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
              </Container>
            );
          }}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default styled(OperationClusterFormAssignmentsList)``;
