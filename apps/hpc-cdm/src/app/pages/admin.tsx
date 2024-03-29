import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { CLASSES, C } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';
import TargetAccessManagement from '../components/target-access-management';
import PageMeta from '../components/page-meta';

const PageAdmin = () => {
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={CLASSES.CONTAINER.CENTERED}>
          <PageMeta title={[t.t(lang, (s) => s.navigation.admin)]} />
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
                  <C.NotFound
                    strings={t.get(lang, (s) => s.components.notFound)}
                  />
                }
              />
            </Routes>
          </C.SidebarNavigation>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default PageAdmin;
