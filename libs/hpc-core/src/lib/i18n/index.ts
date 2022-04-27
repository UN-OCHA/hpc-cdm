import IntlMessageFormat from 'intl-messageformat';
import 'intl-list-format';
import { mapValues } from 'lodash';

import { RecursivePartial, hasKey } from '../util';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Intl {
  interface ListFormatOpts {
    type?: 'conjunction' | 'disjunction' | 'unit';
    style?: 'long' | 'short' | 'narrow';
  }
  class ListFormat {
    constructor(language: string, opts?: ListFormatOpts);
    public format: (items: string[]) => string;
  }
}

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

  /**
   * Convinience method to use when the current language needs to be accessed
   * from outside the scope of a react context
   */
  public withLanguage = <T>(cb: (lang: LanguageKey) => T): T => {
    return cb(this.language);
  };
}

export class Translations<LanguageKey extends string, Strings> {
  private readonly languages: { [key in LanguageKey]: Language<Strings> };

  /**
   * A mapping from language -> string -> IntlMessageFormat
   */
  private readonly formatCache = new Map<
    string,
    Map<string, IntlMessageFormat>
  >();

  public constructor(languages: { [key in LanguageKey]: Language<Strings> }) {
    this.languages = languages;
  }

  public t = (
    lang: LanguageKey,
    get: (s: Strings) => string,
    /**
     * An optional parameter including arguments to use to generate the string
     *
     * If not passed, then the original string from the translations file will
     * be used directly.
     */
    params?: Record<string, string | number | boolean | Date>
  ) => {
    const str = this.get(lang, get);
    if (!params) {
      return str;
    } else {
      let langCache = this.formatCache.get(lang);
      if (!langCache) {
        this.formatCache.set(lang, (langCache = new Map()));
      }
      let cache = langCache.get(str);
      if (!cache) {
        langCache.set(str, (cache = new IntlMessageFormat(str, lang)));
      }
      return cache.format(params) as string;
    }
  };

  /**
   * Get a particular string or object of strings from the strings object.
   */
  public get = <T>(lang: LanguageKey, get: (s: Strings) => T) =>
    get(this.languages[lang].strings);

  public list = (
    lang: LanguageKey,
    strings: string[],
    opts?: Intl.ListFormatOpts
  ) => {
    if (window.Intl) {
      return new Intl.ListFormat(lang, opts).format(strings);
    } else {
      return strings.join(', ');
    }
  };
}
