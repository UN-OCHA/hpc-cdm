import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { type operations } from '@unocha/hpc-data';
import { C } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { useTitle } from '../components/page-meta';
import { getContext } from '../context';
import * as paths from '../paths';

import { TargetAccessManagement } from '../components/target-access-management';

interface Props {
  operation: operations.DetailedOperation;
}

const PageOperationSettings = (props: Props) => {
  const { operation } = props;
  const { lang } = getContext();

  useTitle([t.t(lang, (s) => s.navigation.settings), operation.name]);

  return (
    <C.SidebarNavigation
      menu={[
        operation.permissions.canModifyAccess && {
          label: t.t(lang, (s) => s.navigation.manageAccess),
          path: paths.operationSettingsAccess(operation.id),
        },
      ]}
    >
      <Routes>
        <Route path={paths.home()} element={<Navigate to={paths.access()} />} />
        {operation.permissions.canModifyAccess && (
          <Route
            path={paths.access()}
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
  );
};

export default PageOperationSettings;
