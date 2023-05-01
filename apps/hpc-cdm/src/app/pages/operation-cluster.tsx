import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';

import PageOperationClusterForms from './operation-cluster-forms';
import PageOperationClusterSettings from './operation-cluster-settings';
import PageMeta from '../components/page-meta';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

const PageOperationCluster = (props: Props) => {
  const { operation, cluster } = props;

  const displaySettings = cluster.permissions.canModifyAccess;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <PageMeta title={[cluster.name, operation.name]} />
          <Routes>
            <Route path="" element={<Navigate to={'forms'} />}></Route>
            <Route
              path="/forms/*"
              element={
                <PageOperationClusterForms {...{ operation, cluster }} />
              }
            />
            {displaySettings && (
              <Route
                path="/settings"
                element={
                  <PageOperationClusterSettings {...{ operation, cluster }} />
                }
              />
            )}

            <Route
              path="/*"
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
