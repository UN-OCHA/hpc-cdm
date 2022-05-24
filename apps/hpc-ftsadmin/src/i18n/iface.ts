import { i18n } from '@unocha/hpc-core';
import * as strings from './langs/en.json';

export type Strings = typeof strings;

export type Language = i18n.Language<Strings>;
export type PartialLanguage = i18n.PartialLanguage<Strings>;
