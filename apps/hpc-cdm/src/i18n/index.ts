import { i18n } from '@unocha/hpc-core';
import { Translations } from '@unocha/hpc-ui';

import en from './langs/en';
import es from './langs/es';
import fr from './langs/fr';

import 'intl-list-format/locale-data/en';
import 'intl-list-format/locale-data/es';
import 'intl-list-format/locale-data/fr';

const LANGUAGES = {
  en,
  es,
  fr,
};

export type LanguageKey = keyof typeof LANGUAGES;

export const LANGUAGE_CHOICE = new i18n.LanguageChoice<LanguageKey>(
  LANGUAGES,
  'en'
);

export const t = new Translations(LANGUAGES);
