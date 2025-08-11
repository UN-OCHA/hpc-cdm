import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { C, CLASSES } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { useTitle } from '../components/page-meta';
import TargetAccessManagement from '../components/target-access-management';
import { getContext } from '../context';
import PageNotFound from '../pages/not-found';
import * as paths from '../paths';

const PageAdmin = () => {
  const { lang, access } = getContext();
  const { canModifyGlobalUserAccess } = access().permissions;

  useTitle([t.t(lang, (s) => s.navigation.admin)]);

  if (!canModifyGlobalUserAccess) {
    return <PageNotFound />;
  }

  return (
    <div className={CLASSES.CONTAINER.CENTERED}>
      <C.SidebarNavigation
        menu={[
          {
            label: t.t(lang, (s) => s.navigation.manageAccess),
            path: paths.adminAccess(),
          },
        ]}
      >
        <Routes>
          <Route
            path={paths.home()}
            element={<Navigate to={paths.access()} />}
          />
          <Route
            path={paths.access()}
            element={
              <TargetAccessManagement
                target={{
                  type: 'global',
                }}
              />
            }
          />
          <Route
            path={paths.root()}
            element={
              <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
            }
          />
        </Routes>
      </C.SidebarNavigation>
    </div>
  );
};

export default PageAdmin;
