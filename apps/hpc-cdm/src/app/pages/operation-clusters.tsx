import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import { C, styled, dataLoader } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

import OperationCluster from './operation-cluster';

const CLS = {
  CLUSTERS: 'clusters',
  ABBREVIATION: 'abbrv',
};

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
                  <>
                    <C.Toolbar>
                      <C.Breadcrumbs
                        links={[
                          {
                            label: t.t(lang, (s) => s.navigation.clusters),
                            to: paths.operationClusters(operation.id),
                          },
                        ]}
                      />
                    </C.Toolbar>
                    <ul className={CLS.CLUSTERS}>
                      {clusters.map((cluster, i) => (
                        <li key={i}>
                          <Link
                            to={paths.operationCluster({
                              operationId: operation.id,
                              clusterId: cluster.id,
                            })}
                          >
                            <span className={CLS.ABBREVIATION}>
                              {cluster.abbreviation}
                            </span>
                            {cluster.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
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

export default styled(PageOperationClusters)`
  .${CLS.CLUSTERS} {
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;

    li {
      display: block;
      margin: ${(p) => p.theme.marginPx.sm}px 0;

      a {
        display: flex;
        padding: ${(p) => p.theme.marginPx.md}px 0;
        border: 1px solid ${(p) => p.theme.colors.panel.border};
        border-radius: ${(p) => p.theme.sizing.borderRadiusSm};
        background: ${(p) => p.theme.colors.panel.bg};
        font-size: 1.2rem;

        .${CLS.ABBREVIATION} {
          opacity: 0.4;
          font-weight: bold;
          margin: 0 ${(p) => p.theme.marginPx.md}px;
        }

        &:hover {
          background: ${(p) => p.theme.colors.panel.bgHover};
        }
      }
    }
  }
`;
