import { Session } from '@unocha/hpc-core';
import { Model } from '@unocha/hpc-data';
import { LanguageKey } from '../i18n';

export interface Environment {
  /**
   * Given the current language,
   * return a string if it's neccesary to display a warning message regarding
   * the environment, to avoid users accidentally using a non-prod env
   */
  getDevHeaderWarning: (lang: LanguageKey) => string | undefined;
  session: Session;
  model: Model;
}
