import { render } from '@testing-library/react';
import { ThemeProvider } from '@unocha/hpc-ui';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(baseElement).toBeTruthy();
  });
});
