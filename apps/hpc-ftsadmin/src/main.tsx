import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

import App from './app/app';

ReactDOM.render(
  <BrowserRouter>
    <QueryParamProvider adapter={ReactRouter5Adapter}>
      <App />
    </QueryParamProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
