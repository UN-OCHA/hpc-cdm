import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

const CLS = {
  CLUSTERS: 'clusters',
  ABBREVIATION: 'abbrv',
};

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

const PageOperationCluster = (props: Props) => {
  const { operation, cluster } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <C.Toolbar>
            <C.Breadcrumbs
              links={[
                {
                  label: t.t(lang, (s) => s.navigation.clusters),
                  to: paths.operationClusters(operation.id),
                },
                {
                  label: cluster.name,
                  to: paths.operationCluster({
                    operationId: operation.id,
                    clusterId: cluster.id,
                  }),
                },
              ]}
            />
          </C.Toolbar>
          <C.Tabs
            className={props.className}
            mode="section"
            align="start"
            tabs={[
              {
                label: t.t(lang, (s) => s.navigation.forms),
                path: paths.operationClusterForms({
                  operationId: operation.id,
                  clusterId: cluster.id,
                }),
              },
              {
                label: t.t(lang, (s) => s.navigation.settings),
                path: paths.operationClusterSettings({
                  operationId: operation.id,
                  clusterId: cluster.id,
                }),
              },
            ]}
          />
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
              Forms
            </Route>
            <Route
              path={paths.operationClusterSettings({
                operationId: operation.id,
                clusterId: cluster.id,
              })}
            >
              Settings
            </Route>
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
