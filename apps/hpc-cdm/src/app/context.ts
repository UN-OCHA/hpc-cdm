import { createContext, useContext } from 'react';
import { LanguageKey } from '../i18n';
import { Environment } from '../environments/environment';

interface Context {
  lang: LanguageKey;
  env: () => Environment;
}

export const AppContext = createContext<Context>({
  lang: 'en',
  env: () => {
    throw new Error('Environment not initialized');
  },
});

/* eslint-disable react-hooks/rules-of-hooks */
export const getEnv = () => useContext(AppContext).env();
