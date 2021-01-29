import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { t } from '../../i18n';
import { C, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';
import * as paths from '../paths';

import OperationFormAssignmentsList from '../components/operation-form-assignments-list';
import FormAssignmentData from '../components/form-assignment-data';
import PageMeta from '../components/page-meta';

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
        <Switch>
          <Route
            exact
            path={paths.operationFormAssignments({
              operationId: operation.id,
              windowId: window.id,
            })}
          >
            <OperationFormAssignmentsList {...{ operation, window }} />
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
                        <C.PageTitle>
                          {assignment.assignee.type === 'operation'
                            ? assignment.task.form.name
                            : `${assignment.assignee.clusterName}: ${assignment.task.form.name}`}
                        </C.PageTitle>
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
        </Switch>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationFormAssignments)``;
