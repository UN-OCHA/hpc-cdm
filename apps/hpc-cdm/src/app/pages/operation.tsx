import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { CLASSES, C, combineClasses, styled, dataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

import OperationForms from './operation-forms';
import OperationClusters from './operation-clusters';
import OperationSettings from './operation-settings';

interface Props {
  match: {
    params: {
      id: string;
    };
  };
  className?: string;
}

const PageOperation = (props: Props) => {
  const id = parseInt(props.match.params.id);
  if (isNaN(id)) {
    // TODO: improve this
    return <>Not Found</>;
  }
  const loader = dataLoader([{ id }], getEnv().model.operations.getOperation);

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(
            CLASSES.CONTAINER.CENTERED,
            props.className
          )}
        >
          <C.Loader
            loader={loader}
            strings={{
              ...t.get(lang, (s) => s.components.loader),
              notFound: {
                ...t.get(lang, (s) => s.components.notFound),
                ...t.get(lang, (s) => s.routes.operations.notFound),
              },
            }}
          >
            {({ data: operation }) => {
              const displaySettings = operation.permissions.canModifyAccess;

              return (
                <>
                  <C.Toolbar>
                    <C.Breadcrumbs
                      links={[
                        {
                          label: t.t(lang, (s) => s.navigation.operations),
                          to: paths.operations(),
                        },
                        {
                          label: operation.name,
                          to: paths.operation(id),
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
                        path: paths.operationForms(id),
                      },
                      {
                        label: t.t(lang, (s) => s.navigation.clusters),
                        path: paths.operationClusters(id),
                      },
                      displaySettings && {
                        label: t.t(lang, (s) => s.navigation.settings),
                        path: paths.operationSettings(id),
                      },
                    ]}
                  />
                  <Switch>
                    <Route exact path={paths.operation(id)}>
                      <Redirect to={paths.operationForms(id)} />
                    </Route>
                    <Route path={paths.operationForms(id)}>
                      <OperationForms operation={operation} />
                    </Route>
                    <Route path={paths.operationClusters(id)}>
                      <OperationClusters operation={operation} />
                    </Route>
                    {displaySettings && (
                      <Route path={paths.operationSettings(id)}>
                        <OperationSettings operation={operation} />
                      </Route>
                    )}
                    <Route>
                      <C.NotFound
                        strings={t.get(lang, (s) => s.components.notFound)}
                      />
                    </Route>
                  </Switch>
                </>
              );
            }}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperation)``;
