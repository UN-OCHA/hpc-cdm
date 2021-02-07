import { get } from 'lodash';
import { t as originalTranslate } from 'enketo-core/src/js/fake-translator';

import { LANGUAGE_CHOICE, t } from '../../../../i18n';

export const enketoTranslate = (
  key: string,
  options?: Record<string, string>
) => {
  const lang = LANGUAGE_CHOICE.getLanguage();

  return t.t(
    lang,
    (s) => {
      const override: unknown = get(
        s.routes.operations.forms.enketoStrings,
        key
      );
      if (typeof override === 'string') {
        return override;
      } else {
        return originalTranslate(key, options);
      }
    },
    options
  );
};

export { enketoTranslate as t };
