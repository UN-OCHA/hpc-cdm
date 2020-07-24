import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

import { CLASSES, C, combineClasses, styled, dataLoader } from '@unocha/hpc-ui';
import { operations, reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
}

const Page = (props: Props) => {
  const { operation } = props;
  // Get the single reporting window we will be displaying for now
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(
            CLASSES.CONTAINER.CENTERED,
            props.className
          )}
        >
          {operation.reportingWindows.length === 1 ? (
            <>Window: {operation.reportingWindows[0].name}</>
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
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Page)``;
