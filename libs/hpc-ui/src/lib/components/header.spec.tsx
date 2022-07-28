import React from 'react';
import { render } from '@testing-library/react';

import Header from './header';
import { ThemeProvider } from '../theme';
import { i18n } from '@unocha/hpc-core';

const session = {
  getUser: jest.fn(),
  logIn: jest.fn(),
  logOut: jest.fn(),
};

const en: i18n.Language<unknown> = {
  meta: {
    name: 'English',
    direction: 'ltr',
  },
  strings: {},
};

describe(' Ui', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Header
        session={session}
        language={new i18n.LanguageChoice({ en }, 'en')}
        strings={{
          login: 'Login',
        }}
        userMenu={[
          {
            label: 'Logout',
            onClick: session.logOut,
          },
        ]}
      />,
      { wrapper: ThemeProvider }
    );
    expect(baseElement).toBeTruthy();
  });
});
