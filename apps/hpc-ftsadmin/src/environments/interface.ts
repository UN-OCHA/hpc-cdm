import { type Session } from '@unocha/hpc-core';
import { type Model } from '@unocha/hpc-data';
import { type LanguageKey } from '../i18n';

export interface Environment {
  /**
   * Given the current language,
   * return a string if it's necessary to display a warning message regarding
   * the environment, to avoid users accidentally using a non-prod env
   */
  getDevHeaderWarning: (lang: LanguageKey) => string | undefined;
  externalUrls?: {
    rpmBaseUrl: string | undefined;
    prismBaseUrl: string | undefined;
    ftsWebsiteBaseUrl: string | undefined;
    helpUrl: string | undefined;
  };
  session: Session;
  model: Model;
}
