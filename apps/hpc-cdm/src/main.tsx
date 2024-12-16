import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { ThemeProvider } from '@unocha/hpc-ui';

import App from './app/app';
import './assets/styles/enketo.css';
import { RouteParamsValidator } from './app/components/route-params-validator';
import * as paths from './app/paths';

import PageAdmin from './app/pages/admin';
import PageNotFound from './app/pages/not-found';
import PageOperationsList from './app/pages/operations-list';
import PageOperation from './app/pages/operation';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}
const root = ReactDOM.createRoot(rootElement);

const router = createBrowserRouter([
  {
    path: paths.home(),
    element: (
      <ThemeProvider>
        <App />
      </ThemeProvider>
    ),
    children: [
      { path: paths.home(), element: <Navigate to={paths.operations()} /> },
      { path: paths.operations(), element: <PageOperationsList /> },
      {
        path: paths.operationRoot(),
        element: (
          <RouteParamsValidator element={<PageOperation />} routeParam="id" />
        ),
      },
      {
        path: paths.adminRoot(),
        element: <PageAdmin />,
      },
      { path: paths.root(), element: <PageNotFound /> },
    ],
  },
]);

root.render(<RouterProvider router={router} />);
