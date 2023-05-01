import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { C, combineClasses, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { AppContext } from '../context';
import { LanguageKey, t } from '../../i18n';
import OperationFormAssignments from './operation-form-assignments';
import PageMeta from '../components/page-meta';
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
              path="w/:windowId/*"
              element={<ValidateParams {...props} lang={lang} />}
            />
            <Route
              path=""
              element={
                operation.reportingWindows.length > 0 ? (
                  <Navigate
                    to={`w/${
                      getBestReportingWindow(operation.reportingWindows).id
                    }`}
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
            ></Route>
          </Routes>
        </div>
      )}
    </AppContext.Consumer>
  );
};
interface ValidateParamsProps extends Props {
  lang: LanguageKey;
}

const ValidateParams = (props: ValidateParamsProps) => {
  const { operation, lang } = props;
  const params = useParams();
  const windowId = Number(params.windowId);

  if (!isNaN(windowId)) {
    const windows = operation.reportingWindows.filter((w) => w.id === windowId);
    if (windows.length === 1) {
      return (
        <OperationFormAssignments operation={operation} window={windows[0]} />
      );
    }
  }
  return <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />;
};

export default styled(PageOperationForms)``;
