import { createContext, useContext } from 'react';
import { LanguageKey } from '../i18n';
import { Environment } from '../environments/environment';
import { access } from '@unocha/hpc-data';

interface Context {
  lang: LanguageKey;
  env: () => Environment;
  access: () => access.GetOwnAccessResult;
}

export const AppContext = createContext<Context>({
  lang: 'en',
  env: () => {
    throw new Error('Environment not initialized');
  },
  access: () => {
    throw new Error('Access not initialized');
  },
});

export const contextFromEnv = async (
  env: Environment
): Promise<Omit<Context, 'lang'>> => {
  const perms = await env.model.access.getOwnAccess();
  return {
    env: () => env,
    access: () => perms,
  };
};

/* eslint-disable react-hooks/rules-of-hooks */
export const getContext = () => useContext(AppContext);

/* eslint-disable react-hooks/rules-of-hooks */
export const getEnv = () => useContext(AppContext).env();
