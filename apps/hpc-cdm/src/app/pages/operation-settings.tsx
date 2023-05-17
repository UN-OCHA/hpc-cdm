import React from 'react';
import { Route, Redirect, Routes } from 'react-router-dom';

import { C } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';
import PageMeta from '../components/page-meta';

import { TargetAccessManagement } from '../components/target-access-management';

interface Props {
  operation: operations.DetailedOperation;
}

const PageOperationSettings = (props: Props) => {
  const { operation } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <C.SidebarNavigation
          menu={[
            operation.permissions.canModifyAccess && {
              label: t.t(lang, (s) => s.navigation.manageAccess),
              path: paths.operationSettingsAccess(operation.id),
            },
          ]}
        >
          <PageMeta
            title={[t.t(lang, (s) => s.navigation.settings), operation.name]}
          />
          <Routes>
            <Route
              path={paths.operationSettings(operation.id)}
              element={
                <Redirect to={paths.operationSettingsAccess(operation.id)} />
              }
            />
            {operation.permissions.canModifyAccess && (
              <Route
                path={paths.operationSettingsAccess(operation.id)}
                element={
                  <TargetAccessManagement
                    target={{
                      type: 'operation',
                      targetId: operation.id,
                    }}
                  />
                }
              />
            )}
          </Routes>
        </C.SidebarNavigation>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperationSettings;
