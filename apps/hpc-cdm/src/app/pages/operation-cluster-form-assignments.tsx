import React from 'react';
import { Route, Routes, useParams } from 'react-router';

import { type operations, type reportingWindows } from '@unocha/hpc-data';
import { C, styled } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import ClusterNavigation from '../components/cluster-navigation';
import FormAssignmentData from '../components/form-assignment-data';
import OperationClusterFormAssignmentsList from '../components/operation-cluster-form-assignments-list';
import { useTitle } from '../components/page-meta';
import { RouteParamsValidator } from '../components/route-params-validator';
import { prepareReportingWindowsAsSidebarNavigation } from '../utils/reportingWindows';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

type PageOperationClusterFormAssignmentsRouteParams = {
  windowId: string;
};

const FormAssignmentDataHeader = (
  props: Props & {
    assignment: reportingWindows.GetAssignmentResult;
    window: operations.DetailedOperation['reportingWindows'][number];
  }
) => {
  const { operation, cluster, assignment, window } = props;

  useTitle([assignment.task.form.name, cluster.name, operation.name]);

  return (
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
            assignmentId: assignment.id,
          }),
          label: assignment.task.form.name,
        },
      ]}
      operation={operation}
      cluster={cluster}
    />
  );
};

const PageOperationClusterFormAssignments = (props: Props) => {
  const { operation, cluster, className } = props;

  const { windowId: windowIdString } =
    useParams<PageOperationClusterFormAssignmentsRouteParams>();
  const windowId = parseInt(windowIdString ?? '', 10);

  const windows = operation.reportingWindows.filter((w) => w.id === windowId);
  if (windows.length !== 1) {
    throw new Error(
      `Cannot find unique reporting window with ID ${windowIdString}`
    );
  }
  const window = windows[0];

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={className}>
          <Routes>
            <Route
              path={paths.home()}
              element={
                <>
                  <ClusterNavigation
                    operation={operation}
                    cluster={cluster}
                    shouldShowSettingsButton
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
              path={paths.formAssignmentDataMatch()}
              element={
                <RouteParamsValidator
                  element={
                    <FormAssignmentData
                      header={(assignment) => (
                        <FormAssignmentDataHeader
                          {...props}
                          assignment={assignment}
                          window={window}
                        />
                      )}
                      {...{ window }}
                    />
                  }
                  routeParam="windowId"
                />
              }
            />
            <Route
              path={paths.root()}
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
