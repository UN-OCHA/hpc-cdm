import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { t } from '../../i18n';
import { C, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';
import * as paths from '../paths';

import OperationFormAssignmentsList from '../components/operation-form-assignments-list';
import FormAssignmentData from '../components/form-assignment-data';
import PageMeta from '../components/page-meta';
import { prepareReportingWindowsAsSidebarNavigation } from '../utils/reportingWindows';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  window: reportingWindows.ReportingWindow;
}

const PageOperationFormAssignments = (props: Props) => {
  const { operation, window } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Routes>
          <Route
            path={paths.operationFormAssignments({
              operationId: operation.id,
              windowId: window.id,
            })}
          >
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
          </Route>
          <Route
            path={paths.operationFormAssignmentDataMatch({
              operationId: operation.id,
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
          <Route>
            <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
          </Route>
        </Routes>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationFormAssignments)``;
