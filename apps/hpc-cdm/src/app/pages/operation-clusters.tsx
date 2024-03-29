import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';
import PageMeta from '../components/page-meta';
import { RouteParamsValidator } from '../components/route-params-validator';

import OperationCluster from './operation-cluster';

const Container = styled.div`
  margin-top: ${(p) => p.theme.marginPx.lg}px;
`;

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
}

const PageOperationClusters = (props: Props) => {
  const { operation } = props;

  const loader = dataLoader(
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
        <div className={props.className}>
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
                    <>
                      <PageMeta
                        title={[
                          t.t(lang, (s) => s.navigation.clusters),
                          operation.name,
                        ]}
                      />
                      <Container>
                        <C.List
                          title={t.t(
                            lang,
                            (s) => s.routes.operations.clusters.listHeader
                          )}
                        >
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
                    </>
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
