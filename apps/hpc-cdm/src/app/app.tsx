import React from 'react';
import { BaseStyling, Header } from '@unocha/hpc-ui';

import env from '../environments/environment';

import { Route, Link } from 'react-router-dom';

export const App = () => {
  return (
    <div>
      <BaseStyling />
      <Header session={env.session} />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div>
      <main>
        <Route
          path="/"
          exact
          render={() => (
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          )}
        />
        <Route
          path="/page-2"
          exact
          render={() => (
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          )}
        />
      </main>
    </div>
  );
};

export default App;
