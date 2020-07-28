import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import FormAssignmentData from '../components/form-assignment-data';
import OperationClusterFormAssignmentsList from '../components/operation-cluster-form-assignments-list';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
  window: reportingWindows.ReportingWindow;
}

const PageOperationClusterFormAssignments = (props: Props) => {
  const { operation, cluster, window } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <Switch>
            <Route
              exact
              path={paths.operationClusterFormAssignments({
                operationId: operation.id,
                clusterId: cluster.id,
                windowId: window.id,
              })}
            >
              <OperationClusterFormAssignmentsList
                {...{ operation, cluster, window }}
              />
            </Route>
            <Route
              path={paths.operationClusterFormAssignmentDataMatch({
                operationId: operation.id,
                clusterId: cluster.id,
                windowId: window.id,
              })}
              render={(props: {
                match: { params: { assignmentId: string } };
              }) => {
                const assignmentId = parseInt(props.match.params.assignmentId);
                if (!isNaN(assignmentId)) {
                  return <FormAssignmentData {...{ window, assignmentId }} />;
                } else {
                  return (
                    <C.NotFound
                      strings={t.get(lang, (s) => s.components.notFound)}
                    />
                  );
                }
              }}
            />
            <Route>
              <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
            </Route>
          </Switch>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationClusterFormAssignments)``;
