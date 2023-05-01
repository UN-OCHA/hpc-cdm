import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { LanguageKey, t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';
import PageMeta from '../components/page-meta';
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
                  path=""
                  element={
                    <ClustersList {...props} lang={lang} clusters={clusters} />
                  }
                />
                <Route
                  path=":clusterId/*"
                  element={
                    <ValidateParams
                      {...props}
                      clusters={clusters}
                      lang={lang}
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

interface ClustersListProps extends Props {
  lang: LanguageKey;
  clusters: operations.OperationCluster[];
}
const ClustersList = (props: ClustersListProps) => {
  const { operation, clusters, lang } = props;

  return (
    <>
      <PageMeta
        title={[t.t(lang, (s) => s.navigation.clusters), operation.name]}
      />
      <Container>
        <C.List
          title={t.t(lang, (s) => s.routes.operations.clusters.listHeader)}
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
  );
};

const ValidateParams = (props: ClustersListProps) => {
  const { clusters, operation, lang } = props;

  const params = useParams();
  const clusterId = parseInt(params.clusterId ? params.clusterId : '');
  if (!isNaN(clusterId)) {
    const cluster = clusters.filter((c) => c.id === clusterId);
    if (cluster.length === 1) {
      return <OperationCluster cluster={cluster[0]} {...{ operation }} />;
    }
  }
  return <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />;
};

export default PageOperationClusters;
