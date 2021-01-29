import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import PageOperationClusterForms from './operation-cluster-forms';
import PageOperationClusterSettings from './operation-cluster-settings';
import PageMeta from '../components/page-meta';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

const PageOperationCluster = (props: Props) => {
  const { operation, cluster } = props;

  const displaySettings = cluster.permissions.canModifyAccess;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <PageMeta title={[cluster.name, operation.name]} />
          <Switch>
            <Route
              exact
              path={paths.operationCluster({
                operationId: operation.id,
                clusterId: cluster.id,
              })}
            >
              <Redirect
                to={paths.operationClusterForms({
                  operationId: operation.id,
                  clusterId: cluster.id,
                })}
              />
            </Route>
            <Route
              path={paths.operationClusterForms({
                operationId: operation.id,
                clusterId: cluster.id,
              })}
            >
              <PageOperationClusterForms {...{ operation, cluster }} />
            </Route>
            {displaySettings && (
              <Route
                path={paths.operationClusterSettings({
                  operationId: operation.id,
                  clusterId: cluster.id,
                })}
              >
                <PageOperationClusterSettings {...{ operation, cluster }} />
              </Route>
            )}
            <Route>
              <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
            </Route>
          </Switch>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationCluster)``;
