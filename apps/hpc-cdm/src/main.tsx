import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { THEME } from '@unocha/hpc-ui';

import App from './app/app';

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={THEME}>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
