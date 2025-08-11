import React from 'react';
import { Route, Routes } from 'react-router';

import { type operations } from '@unocha/hpc-data';
import { C, styled, useDataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { useTitle } from '../components/page-meta';
import { RouteParamsValidator } from '../components/route-params-validator';
import { AppContext, getContext, getEnv } from '../context';
import * as paths from '../paths';

import OperationCluster from './operation-cluster';

const Container = styled.div`
  margin-top: ${(p) => p.theme.marginPx.lg}px;
`;

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
}

const OperationClusterMatch = (
  props: Props & { clusters: operations.GetClustersResult['data'] }
) => {
  const { operation, clusters } = props;
  const { lang } = getContext();

  useTitle([t.t(lang, (s) => s.navigation.clusters), operation.name]);

  return (
    <Container>
      <C.List title={t.t(lang, (s) => s.routes.operations.clusters.listHeader)}>
        {clusters
          .sort((c1, c2) => (c1.name > c2.name ? 1 : -1))
          .map((cluster) => (
            <C.ListItem
              key={cluster.id}
              text={cluster.name}
              link={paths.operationCluster({
                operationId: operation.id,
                clusterId: cluster.id,
              })}
            />
          ))}
      </C.List>
    </Container>
  );
};

const PageOperationClusters = (props: Props) => {
  const { operation, className } = props;

  const [loader] = useDataLoader(
    [
      {
        operationId: operation.id,
      },
    ],
    getEnv().model.operations.getClusters
  );

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={className}>
          <C.Loader
            loader={loader}
            strings={{
              ...t.get(lang, (s) => s.components.loader),
              notFound: t.get(lang, (s) => s.components.notFound),
            }}
          >
            {({ data: clusters }) => (
              <Routes>
                <Route
                  path={paths.home()}
                  element={
                    <OperationClusterMatch {...props} clusters={clusters} />
                  }
                />
                <Route
                  path={paths.operationClusterMatch()}
                  element={
                    <RouteParamsValidator
                      element={
                        <OperationCluster
                          clusters={clusters}
                          {...{ operation }}
                        />
                      }
                      routeParam="clusterId"
                    />
                  }
                />
              </Routes>
            )}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperationClusters;
