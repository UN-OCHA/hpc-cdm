import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import PageOperationClusterForms from './operation-cluster-forms';
import PageOperationClusterSettings from './operation-cluster-settings';
import PageMeta from '../components/page-meta';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  clusters: operations.OperationCluster[];
}

type OperationClusterRouteParams = {
  clusterId: string;
};

const PageOperationCluster = (props: Props) => {
  const { operation, clusters } = props;

  const { clusterId: clusterIdString } =
    useParams<OperationClusterRouteParams>();
  const clusterId = parseInt(clusterIdString ?? '', 10);

  const clusterWithMatchingId = clusters.filter((c) => c.id === clusterId);
  if (clusterWithMatchingId.length !== 1) {
    throw new Error(`Cannot find unique cluster with ID ${clusterIdString}`);
  }
  const cluster = clusterWithMatchingId[0];

  const displaySettings = cluster.permissions.canModifyAccess;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <PageMeta title={[cluster.name, operation.name]} />
          <Routes>
            <Route
              path={paths.home()}
              element={<Navigate to={paths.forms()} />}
            />
            <Route
              path={paths.formsRoot()}
              element={
                <PageOperationClusterForms {...{ operation, cluster }} />
              }
            />
            {displaySettings && (
              <Route
                path={paths.settingsRoot()}
                element={
                  <PageOperationClusterSettings {...{ operation, cluster }} />
                }
              />
            )}
            <Route
              path={paths.root()}
              element={
                <C.NotFound
                  strings={t.get(lang, (s) => s.components.notFound)}
                />
              }
            />
          </Routes>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationCluster)``;
