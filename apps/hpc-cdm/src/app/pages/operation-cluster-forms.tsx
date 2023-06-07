import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';
import { getBestReportingWindow } from '../utils/reportingWindows';

import ClusterNavigation from '../components/cluster-navigation';
import { RouteParamsValidator } from '../components/route-params-validator';
import PageOperationClusterFormAssignments from './operation-cluster-form-assignments';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

const PageOperationClusterForms = (props: Props) => {
  const { operation, cluster } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <Routes>
            <Route
              path={paths.formAssignmentsRoot()}
              element={
                <RouteParamsValidator
                  element={
                    <PageOperationClusterFormAssignments
                      {...{ operation, cluster }}
                    />
                  }
                  routeParam="windowId"
                  errorElement={
                    <>
                      <ClusterNavigation
                        operation={operation}
                        cluster={cluster}
                        showSettingsButton
                      />
                      <C.NotFound
                        strings={t.get(lang, (s) => s.components.notFound)}
                      />
                    </>
                  }
                />
              }
            />
            <Route
              path={paths.home()}
              element={
                operation.reportingWindows.length > 0 ? (
                  <Navigate
                    to={
                      paths.reportingWindow() +
                      getBestReportingWindow(operation.reportingWindows).id
                    }
                  />
                ) : (
                  <C.ErrorMessage
                    strings={{
                      title: 'No reporting windows',
                      info: "This operation doesn't have any reporting windows associated with it",
                    }}
                  />
                )
              }
            />
          </Routes>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationClusterForms)``;
