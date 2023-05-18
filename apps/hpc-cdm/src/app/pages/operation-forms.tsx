import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { C, combineClasses, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { AppContext } from '../context';
import { t } from '../../i18n';
import OperationFormAssignments from './operation-form-assignments';
import * as paths from '../paths';
import PageMeta from '../components/page-meta';
import { RouteParamsValidator } from '../components/route-params-validator';
import { getBestReportingWindow } from '../utils/reportingWindows';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
}

const PageOperationForms = (props: Props) => {
  const { operation } = props;
  // Get the single reporting window we will be displaying for now
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={combineClasses(props.className)}>
          <PageMeta
            title={[t.t(lang, (s) => s.navigation.forms), operation.name]}
          />
          <Routes>
            <Route
              path={paths.formAssignmentsRoot()}
              element={
                <RouteParamsValidator
                  element={<OperationFormAssignments operation={operation} />}
                  routeParam="windowId"
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

export default styled(PageOperationForms)``;
