import React from 'react';
import { Route } from 'react-router-dom';

import * as paths from '../paths';

import PageOperationsList from '../pages/operations-list';
import PageOperation from '../pages/operation';

export default () => (
  <>
    <Route path={paths.OPERATIONS} exact component={PageOperationsList} />
    <Route path={paths.OPERATION} exact component={PageOperation} />
  </>
);
