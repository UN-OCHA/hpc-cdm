import { i18n } from '@unocha/hpc-core';
import merge from 'lodash/merge';

import ar from './langs/ar';
import en from './langs/en';
import fr from './langs/fr';

import 'intl-list-format/locale-data/ar';
import 'intl-list-format/locale-data/en';
import 'intl-list-format/locale-data/fr';

const LANGUAGES = {
  en,
  // ar: merge({}, en, ar),
  fr: merge({}, en, fr),
};

export const LANGUAGE_CHOICE = new i18n.LanguageChoice(LANGUAGES, 'en');

export type LanguageKey = keyof typeof LANGUAGES;

export const t = new i18n.Translations(LANGUAGES);
