import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { CLASSES, C, dataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

import OperationForms from './operation-forms';
import OperationClusters from './operation-clusters';
import OperationSettings from './operation-settings';
import PageMeta from '../components/page-meta';

type OperationRouteParams = {
  id: string;
};

const PageOperation = () => {
  const { id: idString } = useParams<OperationRouteParams>();
  const id = parseInt(idString ?? '', 10);

  const loader = dataLoader([{ id }], getEnv().model.operations.getOperation);

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div>
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
              const displayClusters =
                operation.permissions.canModifyClusterAccessAndPermissions;

              return (
                <>
                  <PageMeta title={[operation.name]} />
                  <C.SecondaryNavigation
                    breadcrumbs={[
                      {
                        label: t.t(lang, (s) => s.navigation.operations),
                        to: paths.operations(),
                      },
                      {
                        label: operation.name,
                        to: paths.operation(id),
                      },
                    ]}
                    tabs={[
                      {
                        label: t.t(lang, (s) => s.navigation.forms),
                        path: paths.operationForms(id),
                      },
                      displayClusters && {
                        label: t.t(lang, (s) => s.navigation.clusters),
                        path: paths.operationClusters(id),
                      },
                      displaySettings && {
                        label: t.t(lang, (s) => s.navigation.settings),
                        path: paths.operationSettings(id),
                      },
                    ]}
                  />
                  <div className={CLASSES.CONTAINER.CENTERED}>
                    <Routes>
                      <Route
                        path={paths.operation(id)}
                        element={<Navigate to={paths.operationForms(id)} />}
                      />
                      <Route
                        path={paths.operationForms(id)}
                        element={<OperationForms operation={operation} />}
                      />
                      {displayClusters && (
                        <Route
                          path={paths.operationClusters(id)}
                          element={<OperationClusters operation={operation} />}
                        />
                      )}
                      {displaySettings && (
                        <Route
                          path={paths.operationSettings(id)}
                          element={<OperationSettings operation={operation} />}
                        />
                      )}
                      <Route
                        element={
                          <C.NotFound
                            strings={t.get(lang, (s) => s.components.notFound)}
                          />
                        }
                      />
                    </Routes>
                  </div>
                </>
              );
            }}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperation;
