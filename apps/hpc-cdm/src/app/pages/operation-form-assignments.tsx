import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { t } from '../../i18n';
import { C, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';
import * as paths from '../paths';

import OperationFormAssignmentsList from '../components/operation-form-assignments-list';
import OperationFormAssignmentData from './operation-form-assignment-data';

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
            // TODO: remove exact when we have further nested paths
            // for history of an assignment
            exact
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
                  <OperationFormAssignmentData
                    {...{ operation, window, assignmentId }}
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
