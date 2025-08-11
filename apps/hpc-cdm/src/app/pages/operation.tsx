import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext, getContext, getEnv } from '../context';
import * as paths from '../paths';

import { type operations } from '@unocha/hpc-data';
import { useTitle } from '../components/page-meta';
import OperationClusters from './operation-clusters';
import OperationForms from './operation-forms';
import OperationSettings from './operation-settings';

type OperationRouteParams = {
  id: string;
};
type Props = {
  id: number;
  operation: operations.GetOperationResult['data'];
  shouldDisplayClusters: boolean;
  shouldDisplaySettings: boolean;
};

const Operation = (props: Props) => {
  const { id, operation, shouldDisplayClusters, shouldDisplaySettings } = props;
  const { lang } = getContext();

  useTitle([operation.name]);

  return (
    <>
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
          shouldDisplayClusters && {
            label: t.t(lang, (s) => s.navigation.clusters),
            path: paths.operationClusters(id),
          },
          shouldDisplaySettings && {
            label: t.t(lang, (s) => s.navigation.settings),
            path: paths.operationSettings(id),
          },
        ]}
      />
      <div className={CLASSES.CONTAINER.CENTERED}>
        <Routes>
          <Route
            path={paths.home()}
            element={<Navigate to={paths.forms()} />}
          />
          <Route
            path={paths.formsRoot()}
            element={<OperationForms operation={operation} />}
          />
          {shouldDisplayClusters && (
            <Route
              path={paths.operationClustersRoot()}
              element={<OperationClusters operation={operation} />}
            />
          )}
          {shouldDisplaySettings && (
            <Route
              path={paths.settingsRoot()}
              element={<OperationSettings operation={operation} />}
            />
          )}
          <Route
            path={paths.root()}
            element={
              <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
            }
          />
        </Routes>
      </div>
    </>
  );
};

const PageOperation = () => {
  const { id: idString } = useParams<OperationRouteParams>();
  const id = parseInt(idString ?? '', 10);

  const [loader] = useDataLoader(
    [{ id }],
    getEnv().model.operations.getOperation
  );

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
              const shouldDisplaySettings =
                operation.permissions.canModifyAccess;
              const shouldDisplayClusters =
                operation.permissions.canModifyClusterAccessAndPermissions;

              return (
                <Operation
                  {...{
                    id,
                    operation,
                    shouldDisplaySettings,
                    shouldDisplayClusters,
                  }}
                />
              );
            }}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperation;
