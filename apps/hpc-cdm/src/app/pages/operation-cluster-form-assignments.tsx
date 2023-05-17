import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import ClusterNavigation from '../components/cluster-navigation';
import FormAssignmentData from '../components/form-assignment-data';
import OperationClusterFormAssignmentsList from '../components/operation-cluster-form-assignments-list';
import PageMeta from '../components/page-meta';
import { prepareReportingWindowsAsSidebarNavigation } from '../utils/reportingWindows';

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
          <Routes>
            <Route
              path={paths.operationClusterFormAssignments({
                operationId: operation.id,
                clusterId: cluster.id,
                windowId: window.id,
              })}
              element={
                <>
                  <ClusterNavigation
                    operation={operation}
                    cluster={cluster}
                    showSettingsButton
                  />
                  <C.SidebarNavigation
                    menu={prepareReportingWindowsAsSidebarNavigation(
                      lang,
                      operation.reportingWindows,
                      (w) =>
                        paths.operationClusterFormAssignments({
                          operationId: operation.id,
                          clusterId: cluster.id,
                          windowId: w.id,
                        })
                    )}
                  >
                    <OperationClusterFormAssignmentsList
                      {...{ operation, cluster, window }}
                    />
                  </C.SidebarNavigation>
                </>
              }
            />
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
                  return (
                    <FormAssignmentData
                      header={(assignment) => (
                        <>
                          <PageMeta
                            title={[
                              assignment.task.form.name,
                              cluster.name,
                              operation.name,
                            ]}
                          />
                          <ClusterNavigation
                            breadcrumbs={[
                              {
                                to: paths.operationClusterFormAssignments({
                                  operationId: operation.id,
                                  clusterId: cluster.id,
                                  windowId: window.id,
                                }),
                                label: window.name,
                              },
                              {
                                to: paths.operationClusterFormAssignmentData({
                                  operationId: operation.id,
                                  clusterId: cluster.id,
                                  windowId: window.id,
                                  assignmentId,
                                }),
                                label: assignment.task.form.name,
                              },
                            ]}
                            operation={operation}
                            cluster={cluster}
                          />
                        </>
                      )}
                      {...{ window, assignmentId }}
                    />
                  );
                } else {
                  return (
                    <C.NotFound
                      strings={t.get(lang, (s) => s.components.notFound)}
                    />
                  );
                }
              }}
            />
            <Route
              element={
                <C.NotFound
                  strings={t.get(lang, (s) => s.components.notFound)}
                />
              }
            />
          </Routes>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationClusterFormAssignments)``;
