import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

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
              <Switch>
                <Route exact path={paths.operationClusters(operation.id)}>
                  <Container>
                    <C.List
                      title={t.t(
                        lang,
                        (s) => s.routes.operations.clusters.listHeader
                      )}
                    >
                      {clusters.map((cluster, i) => (
                        <C.ListItem
                          text={cluster.name}
                          link={paths.operationCluster({
                            operationId: operation.id,
                            clusterId: cluster.id,
                          })}
                        />
                      ))}
                    </C.List>
                  </Container>
                </Route>
                <Route
                  path={paths.operationClusterMatch({
                    operationId: operation.id,
                  })}
                  render={(props: {
                    match: { params: { clusterId: string } };
                  }) => {
                    const clusterId = parseInt(props.match.params.clusterId);
                    if (!isNaN(clusterId)) {
                      const cluster = clusters.filter(
                        (c) => c.id === clusterId
                      );
                      if (cluster.length === 1) {
                        return (
                          <OperationCluster
                            cluster={cluster[0]}
                            {...{ operation }}
                          />
                        );
                      }
                    }
                    return (
                      <C.NotFound
                        strings={t.get(lang, (s) => s.components.notFound)}
                      />
                    );
                  }}
                />
              </Switch>
            )}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default PageOperationClusters;
