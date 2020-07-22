import * as React from 'react';
import { LanguageKey } from '../i18n';

interface Context {
  lang: LanguageKey;
}

export const AppContext = React.createContext<Context>({
  lang: 'en',
});
