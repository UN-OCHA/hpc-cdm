import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { C } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

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
            {
              label: t.t(lang, (s) => s.navigation.manageAccess),
              path: paths.operationSettingsAccess(operation.id),
            },
          ]}
        >
          <Switch>
            <Route exact path={paths.operationSettings(operation.id)}>
              <Redirect to={paths.operationSettingsAccess(operation.id)} />
            </Route>
            <Route exact path={paths.operationSettingsAccess(operation.id)}>
              <TargetAccessManagement
                target={{
                  type: 'operation',
                  targetId: operation.id,
                }}
              />
            </Route>
          </Switch>
        </C.SidebarNavigation>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperationSettings;
