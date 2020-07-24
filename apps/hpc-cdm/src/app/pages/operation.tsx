import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { CLASSES, C, combineClasses, styled, dataLoader } from '@unocha/hpc-ui';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

interface Props {
  match: {
    params: {
      id: string;
    };
  };
  className?: string;
}

const Page = (props: Props) => {
  const id = parseInt(props.match.params.id);
  if (isNaN(id)) {
    // TODO: improve this
    return <>Not Found</>;
  }
  const loader = dataLoader([{ id }], env.model.operations.getOperation);

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
            strings={t.get(lang, (s) => s.components.loader)}
          >
            {(data) => (
              <>
                <C.Toolbar>
                  <C.Breadcrumbs
                    links={[
                      {
                        label: t.t(lang, (s) => s.navigation.operations),
                        to: paths.OPERATIONS,
                      },
                      {
                        label: data.data.name,
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
                    {
                      label: t.t(lang, (s) => s.navigation.settings),
                      path: paths.operationSettings(id),
                    },
                  ]}
                />
                <Switch>
                  <Route exact path={paths.operation(id)}>
                    <Redirect to={paths.operationForms(id)} />
                  </Route>
                  <Route path={paths.operationForms(id)}>Forms</Route>
                  <Route path={paths.operationClusters(id)}>Clusters</Route>
                  <Route path={paths.operationSettings(id)}>Settings</Route>
                  <Route>
                    <C.NotFound
                      strings={t.get(lang, (s) => s.components.notFound)}
                    />
                  </Route>
                </Switch>
              </>
            )}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Page)``;
