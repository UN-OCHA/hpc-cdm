import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';
import { getBestReportingWindow } from '../utils/reportingWindows';

import ClusterNavigation from '../components/cluster-navigation';
import PageOperationClusterFormAssignments from './operation-cluster-form-assignments';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

const PageOperationClusterForms = (props: Props) => {
  const { operation, cluster } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <Switch>
            <Route
              path={paths.operationClusterFormAssignmentsMatch({
                operationId: operation.id,
                clusterId: cluster.id,
              })}
              render={(props: { match: { params: { windowId: string } } }) => {
                const id = parseInt(props.match.params.windowId);
                if (!isNaN(id)) {
                  const windows = operation.reportingWindows.filter(
                    (w) => w.id === id
                  );
                  if (windows.length === 1) {
                    console.log(props);
                    return (
                      <PageOperationClusterFormAssignments
                        window={windows[0]}
                        {...{ operation, cluster }}
                      />
                    );
                  }
                }
                return (
                  <>
                    <ClusterNavigation
                      operation={operation}
                      cluster={cluster}
                      showSettingsButton
                    />
                    <C.NotFound
                      strings={t.get(lang, (s) => s.components.notFound)}
                    />
                  </>
                );
              }}
            />
            <Route>
              {operation.reportingWindows.length > 0 ? (
                <Redirect
                  to={paths.operationClusterFormAssignments({
                    operationId: operation.id,
                    clusterId: cluster.id,
                    windowId: getBestReportingWindow(operation.reportingWindows)
                      .id,
                  })}
                />
              ) : (
                <C.ErrorMessage
                  strings={{
                    title: 'No reporting windows',
                    info: "This operation doesn't have any reporting windows associated with it",
                  }}
                />
              )}
            </Route>
          </Switch>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationClusterForms)``;
