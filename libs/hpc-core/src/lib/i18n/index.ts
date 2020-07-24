import { mapValues } from 'lodash';

import { RecursivePartial, hasKey } from '../util';

export interface Language<Strings> {
  meta: {
    /**
     * The native name of this language
     */
    name: string;
    /**
     * Is this language left-to-right or right-to-left
     */
    direction: 'ltr' | 'rtl';
  };
  strings: Strings;
}

export type PartialLanguage<Strings> = Language<RecursivePartial<Strings>>;

const STORAGE_KEY = 'hpc-lang';

/**
 * Class that manages the user's choice of language to display,
 * and also updates the root html element with appropriate attributes.
 */
export class LanguageChoice<LanguageKey extends string> {
  private readonly languages: {
    [key in LanguageKey]: Language<unknown>['meta'];
  };

  private readonly listeners = new Set<(lang: LanguageKey) => void>();

  private language: LanguageKey;

  public constructor(
    languages: { [key in LanguageKey]: Language<unknown> },
    defaultLang: LanguageKey
  ) {
    this.languages = mapValues(languages, (l) => l.meta);
    const detectedLang = this.detectLanguage();
    if (detectedLang) {
      this.language = detectedLang;
    } else {
      this.language = defaultLang;
    }
    this.applyLanguage();
  }

  private detectLanguage = () => {
    const pref = localStorage.getItem(STORAGE_KEY);
    const isLanguageKey = (key: string | null): key is LanguageKey =>
      hasKey(this.languages, key);
    if (isLanguageKey(pref)) {
      return pref;
    }
    const supportedBrowserLanguages = window.navigator.languages
      .map((l) => l.split('-')[0])
      .filter(isLanguageKey);
    if (supportedBrowserLanguages.length > 0) {
      return supportedBrowserLanguages[0];
    }
    return null;
  };

  public getLanguage = () => this.language;

  public setLanguage = (lang: LanguageKey) => {
    this.language = lang;
    this.listeners.forEach((l) => l(lang));
    localStorage.setItem(STORAGE_KEY, lang);
    this.applyLanguage();
  };

  public addListener = (l: (lang: LanguageKey) => void) =>
    this.listeners.add(l);

  public removeListener = (l: (lang: LanguageKey) => void) =>
    this.listeners.delete(l);

  public getLanguages = () =>
    Object.entries<Language<unknown>['meta']>(this.languages).map(
      ([key, value]) => ({
        key: key as LanguageKey,
        ...value,
      })
    );

  /**
   * Apply the current language to the root html element
   */
  private applyLanguage = () => {
    document.documentElement.lang = this.language;
    const meta = this.languages[this.language];
    if (meta.direction === 'ltr') {
      document.documentElement.removeAttribute('dir');
    } else {
      document.documentElement.setAttribute('dir', meta.direction);
    }
  };
}

export class Translations<LanguageKey extends string, Strings> {
  private readonly languages: { [key in LanguageKey]: Language<Strings> };

  public constructor(languages: { [key in LanguageKey]: Language<Strings> }) {
    this.languages = languages;
  }

  /**
   * TODO: extend this with formatting using intl-messageformat
   */
  public t = (lang: LanguageKey, get: (s: Strings) => string) =>
    this.get(lang, get);

  /**
   * Get a particular string or object of strings from the strings object.
   */
  public get = <T>(lang: LanguageKey, get: (s: Strings) => T) =>
    get(this.languages[lang].strings);
}
