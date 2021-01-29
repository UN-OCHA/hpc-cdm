import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { C, combineClasses, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { AppContext } from '../context';
import { t } from '../../i18n';
import OperationFormAssignments from './operation-form-assignments';
import * as paths from '../paths';
import PageMeta from '../components/page-meta';

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
          <Switch>
            <Route
              path={paths.operationFormAssignmentsMatch({
                operationId: operation.id,
              })}
              render={(props: { match: { params: { windowId: string } } }) => {
                const id = parseInt(props.match.params.windowId);
                if (!isNaN(id)) {
                  const windows = operation.reportingWindows.filter(
                    (w) => w.id === id
                  );
                  if (windows.length === 1) {
                    console.log(props);
                    return (
                      <OperationFormAssignments
                        operation={operation}
                        window={windows[0]}
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
            <Route>
              {operation.reportingWindows.length === 1 ? (
                <Redirect
                  to={paths.operationFormAssignments({
                    operationId: operation.id,
                    windowId: operation.reportingWindows[0].id,
                  })}
                />
              ) : operation.reportingWindows.length === 0 ? (
                <C.ErrorMessage
                  strings={{
                    title: 'No reporting windows',
                    info:
                      "This operation doesn't have any reporting windows associated with it",
                  }}
                />
              ) : (
                <C.ErrorMessage
                  strings={{
                    title: 'Multiple reporting windows',
                    info:
                      'This operation has multiple reporting windows associated with it, currently only 1 window is supported at a time.',
                  }}
                />
              )}
            </Route>
          </Switch>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(PageOperationForms)``;
