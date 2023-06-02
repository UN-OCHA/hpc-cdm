import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { t } from '../../i18n';
import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { AppContext } from '../context';
import * as paths from '../paths';

import OperationFormAssignmentsList from '../components/operation-form-assignments-list';
import FormAssignmentData from '../components/form-assignment-data';
import PageMeta from '../components/page-meta';
import { RouteParamsValidator } from '../components/route-params-validator';
import { prepareReportingWindowsAsSidebarNavigation } from '../utils/reportingWindows';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
}

type OperationFormAssignmentsRouteParams = {
  windowId: string;
};

const PageOperationFormAssignments = (props: Props) => {
  const { operation } = props;

  const { windowId: windowIdString } =
    useParams<OperationFormAssignmentsRouteParams>();
  const windowId = parseInt(windowIdString ?? '');

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
        <Routes>
          <Route
            path={paths.home()}
            element={
              <C.SidebarNavigation
                menu={prepareReportingWindowsAsSidebarNavigation(
                  lang,
                  operation.reportingWindows,
                  (w) =>
                    paths.operationFormAssignments({
                      operationId: operation.id,
                      windowId: w.id,
                    })
                )}
              >
                <OperationFormAssignmentsList {...{ operation, window }} />
              </C.SidebarNavigation>
            }
          />
          <Route
            path={paths.formAssignmentDataMatch()}
            element={
              <RouteParamsValidator
                routeParam="assignmentId"
                element={
                  <FormAssignmentData
                    header={(assignment) => (
                      <>
                        <PageMeta
                          title={[
                            assignment.task.form.name,
                            ...(assignment.assignee.type === 'operationCluster'
                              ? [assignment.assignee.clusterName]
                              : []),
                            operation.name,
                          ]}
                        />
                        <C.TertiaryNavigation
                          breadcrumbs={[
                            {
                              label: window.name,
                              to: paths.operationFormAssignments({
                                operationId: operation.id,
                                windowId: window.id,
                              }),
                            },
                            {
                              label:
                                assignment.assignee.type === 'operation'
                                  ? assignment.task.form.name
                                  : `${assignment.assignee.clusterName}: ${assignment.task.form.name}`,
                              to: paths.operationFormAssignmentData({
                                operationId: operation.id,
                                windowId: window.id,
                                assignmentId: assignment.id,
                              }),
                            },
                          ]}
                        />
                      </>
                    )}
                    {...{ window }}
                  />
                }
              />
            }
          />
          <Route
            path={paths.root()}
            element={
              <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
            }
          />
        </Routes>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationFormAssignments)``;
