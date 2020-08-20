import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { C } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import { TargetAccessManagement } from '../components/target-access-management';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

const PageOperationClusterSettings = (props: Props) => {
  const { operation, cluster } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <C.SidebarNavigation
          menu={[
            {
              label: t.t(lang, (s) => s.navigation.manageAccess),
              path: paths.operationClusterSettingsAccess({
                operationId: operation.id,
                clusterId: cluster.id,
              }),
            },
          ]}
        >
          <Switch>
            <Route
              exact
              path={paths.operationClusterSettings({
                operationId: operation.id,
                clusterId: cluster.id,
              })}
            >
              <Redirect
                to={paths.operationClusterSettingsAccess({
                  operationId: operation.id,
                  clusterId: cluster.id,
                })}
              />
            </Route>
            <Route
              exact
              path={paths.operationClusterSettingsAccess({
                operationId: operation.id,
                clusterId: cluster.id,
              })}
            >
              <TargetAccessManagement
                target={{
                  type: 'operationCluster',
                  targetId: cluster.id,
                }}
              />
            </Route>
          </Switch>
        </C.SidebarNavigation>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperationClusterSettings;
