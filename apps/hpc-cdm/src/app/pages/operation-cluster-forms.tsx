import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

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
                  <C.NotFound
                    strings={t.get(lang, (s) => s.components.notFound)}
                  />
                );
              }}
            />
            <Route>
              {operation.reportingWindows.length === 1 ? (
                <Redirect
                  to={paths.operationClusterFormAssignments({
                    operationId: operation.id,
                    clusterId: cluster.id,
                    windowId: operation.reportingWindows[0].id,
                  })}
                />
              ) : operation.reportingWindows.length === 0 ? (
                <C.ErrorMessage
                  strings={{
                    title: 'No reporting windows',
                    info:
                      "This operation doesn't have any reporting windows associated with it",
                  }}
                />
              ) : (
                <C.ErrorMessage
                  strings={{
                    title: 'Multiple reporting windows',
                    info:
                      'This operation has multiple reporting windows associated with it, currently only 1 window is supported at a time.',
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
