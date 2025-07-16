import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import App from './app/app';

import PageFlow from './app/pages/flows/flow';
import PageFlowsList from './app/pages/flows/flows-list';
import PagePendingFlowsList from './app/pages/flows/pending-flows-list';
import PageKeywordsList from './app/pages/keywords/keyword-list';
import PageNotFound from './app/pages/not-found';
import PageOrganization from './app/pages/organizations/organization';
import PageOrganizationsList from './app/pages/organizations/organization-list';
import PageUploadXLSX from './app/pages/upload-xlsx/upload-xlsx';
import paths from './app/paths';

import { RouteParamsValidator } from './app/components/route-params-validator';

const rootElement = document.querySelector('#root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}
const root = ReactDOM.createRoot(rootElement);

const router = createBrowserRouter([
  {
    path: paths.home(),
    element: <App />,
    children: [
      { path: paths.home(), element: <Navigate to={paths.flows()} /> },
      { path: paths.flows(), element: <PageFlowsList /> },
      { path: paths.addFlow(), element: <PageFlow /> },
      {
        path: paths.flowMatcher(),
        element: (
          <RouteParamsValidator
            element={<PageFlow />}
            routeParams={['id', 'version']}
          />
        ),
      },
      { path: paths.pendingFlows(), element: <PagePendingFlowsList /> },
      { path: paths.organizations(), element: <PageOrganizationsList /> },
      {
        path: paths.organizationMatcher(),
        element: (
          <RouteParamsValidator
            element={<PageOrganization />}
            routeParams={['id']}
          />
        ),
      },
      { path: paths.addOrganization(), element: <PageOrganization /> },
      { path: paths.keywords(), element: <PageKeywordsList /> },
      { path: paths.uploadXLSX(), element: <PageUploadXLSX /> },
      { path: paths.splat(), element: <PageNotFound /> },
    ],
  },
]);
root.render(<RouterProvider router={router} />);
