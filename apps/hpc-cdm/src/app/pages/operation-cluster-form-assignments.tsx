import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { LanguageKey, t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

import ClusterNavigation from '../components/cluster-navigation';
import FormAssignmentData from '../components/form-assignment-data';
import OperationClusterFormAssignmentsList from '../components/operation-cluster-form-assignments-list';
import PageMeta from '../components/page-meta';
import { prepareReportingWindowsAsSidebarNavigation } from '../utils/reportingWindows';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
  window: reportingWindows.ReportingWindow;
}

const PageOperationClusterFormAssignments = (props: Props) => {
  const { operation, cluster, window } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <Routes>
            <Route
              path=""
              element={
                <>
                  <ClusterNavigation
                    operation={operation}
                    cluster={cluster}
                    showSettingsButton
                  />
                  <C.SidebarNavigation
                    menu={prepareReportingWindowsAsSidebarNavigation(
                      lang,
                      operation.reportingWindows,
                      (w) =>
                        paths.operationClusterFormAssignments({
                          operationId: operation.id,
                          clusterId: cluster.id,
                          windowId: w.id,
                        })
                    )}
                  >
                    <OperationClusterFormAssignmentsList
                      {...{ operation, cluster, window }}
                    />
                  </C.SidebarNavigation>
                </>
              }
            />
            <Route
              path="/data/:assignmentId"
              element={<TemporalForm {...props} lang={lang} />}
            />
            <Route
              path="*"
              element={
                <C.NotFound
                  strings={t.get(lang, (s) => s.components.notFound)}
                />
              }
            ></Route>
          </Routes>
        </div>
      )}
    </AppContext.Consumer>
  );
};
interface TemporalFormProps extends Props {
  lang: LanguageKey;
}
const TemporalForm = (props: TemporalFormProps) => {
  const { cluster, operation, window, lang } = props;
  const params = useParams();
  const assignmentId = Number(params.assignmentId);

  if (!isNaN(assignmentId)) {
    return (
      <FormAssignmentData
        header={(assignment) => (
          <>
            <PageMeta
              title={[assignment.task.form.name, cluster.name, operation.name]}
            />
            <ClusterNavigation
              breadcrumbs={[
                {
                  to: paths.operationClusterFormAssignments({
                    operationId: operation.id,
                    clusterId: cluster.id,
                    windowId: window.id,
                  }),
                  label: window.name,
                },
                {
                  to: paths.operationClusterFormAssignmentData({
                    operationId: operation.id,
                    clusterId: cluster.id,
                    windowId: window.id,
                    assignmentId,
                  }),
                  label: assignment.task.form.name,
                },
              ]}
              operation={operation}
              cluster={cluster}
            />
          </>
        )}
        {...{ window, assignmentId }}
      />
    );
  }
  return <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />;
};
export default styled(PageOperationClusterFormAssignments)``;
