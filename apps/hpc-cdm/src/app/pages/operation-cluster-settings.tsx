import React from 'react';
import { Route, Redirect, Routes } from 'react-router-dom';

import { C } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import ClusterNavigation from '../components/cluster-navigation';
import { TargetAccessManagement } from '../components/target-access-management';
import PageMeta from '../components/page-meta';

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
        <>
          <PageMeta
            title={[
              t.t(lang, (s) => s.navigation.settings),
              cluster.name,
              operation.name,
            ]}
          />
          <ClusterNavigation
            operation={operation}
            cluster={cluster}
            showSettingsButton
          />
          <C.SidebarNavigation
            menu={[
              cluster.permissions.canModifyAccess && {
                label: t.t(lang, (s) => s.navigation.manageAccess),
                path: paths.operationClusterSettingsAccess({
                  operationId: operation.id,
                  clusterId: cluster.id,
                }),
              },
            ]}
          >
            <Routes>
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
              {cluster.permissions.canModifyAccess && (
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
              )}
            </Routes>
          </C.SidebarNavigation>
        </>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperationClusterSettings;
