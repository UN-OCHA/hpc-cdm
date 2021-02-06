import React from 'react';
import IntlMessageFormat from 'intl-messageformat';

import { i18n } from '@unocha/hpc-core';

/**
 * A regular expression that will find and extract the **first** component
 * placeholder in a string.
 *
 * e.g: `"something {a_placeholder, component} something else "`
 *
 * When using this regular expression, it can be assumed that the first capture
 * group will not contain any further component placeholders.
 */
const LAZY_PLACEHOLDER_FINDER = /^(.*?)\{([a-zA-Z_]+)\s*,\s*component\}(.*)$/;

type ParsedTranslation = Array<
  | {
      type: 'placeholder';
      name: string;
    }
  | {
      type: 'format';
      format: IntlMessageFormat;
    }
>;

/**
 * Convert an arbitrary string into an array of placeholder names or
 * IntlMessageFormat objects for the string
 */
const parseString = (lang: string, str: string): ParsedTranslation => {
  const parsed: ParsedTranslation = [];
  let next = str;
  let e: null | RegExpExecArray = null;
  while ((e = LAZY_PLACEHOLDER_FINDER.exec(next))) {
    /** The text before the placeholder */
    const before = e[1];
    /** The name of the placeholder (to use in the components object) */
    const name = e[2];
    // Set the next string to match to the remainder of the text after
    // the placeholder.
    next = e[3];
    parsed.push({
      type: 'format',
      format: new IntlMessageFormat(before, lang),
    });
    parsed.push({
      type: 'placeholder',
      name,
    });
  }
  // Add remainder of string to parsed
  parsed.push({
    type: 'format',
    format: new IntlMessageFormat(next, lang),
  });
  return parsed;
};

/**
 * An extension of the core Translations class that adds functionality to
 * place react components in translated strings via placeholders.
 */
export class Translations<
  LanguageKey extends string,
  Strings
> extends i18n.Translations<LanguageKey, Strings> {
  /**
   * A mapping from language -> string -> ParsedTranslation
   */
  private readonly componentStringCache = new Map<
    string,
    Map<string, ParsedTranslation>
  >();

  /**
   * Compose a translation with component placeholders.
   */
  public c = (
    lang: LanguageKey,
    get: (s: Strings) => string,
    /**
     * A mapping from placeholder names to components to place in those
     * placeholder locations. The given key argument should be passed to the
     * child component as the `key` prop.
     */
    components: Record<string, (key: number) => JSX.Element>,
    /**
     * An optional parameter including arguments to use to generate the string
     *
     * If not passed, then the original string from the translations file will
     * be used directly.
     */
    params?: Record<string, string | number | boolean | Date>
  ) => {
    const str = this.get(lang, get);
    let langCache = this.componentStringCache.get(lang);
    if (!langCache) {
      this.componentStringCache.set(lang, (langCache = new Map()));
    }
    let cache = langCache.get(str);
    if (!cache) {
      langCache.set(str, (cache = parseString(lang, str)));
    }
    return (
      <>
        {cache.map((v, i) =>
          v.type === 'format' ? (
            <span key={i}>{v.format.format(params)}</span>
          ) : (
            components[v.name]?.(i)
          )
        )}
      </>
    );
  };
}
