import { type organizations } from '@unocha/hpc-data';
import { type LanguageKey, t } from '../../i18n';
import dayjs from 'dayjs';

export const valueToInteger = (value: string | number) => {
  return typeof value === 'number' ? value : parseInt(value);
};

export const parseUpdatedCreatedBy = (
  updatedCreatedBy: organizations.UpdatedCreatedBy[],
  lang: LanguageKey
): string => {
  if (updatedCreatedBy.length === 0) {
    return '--';
  }
  const { participantName, date } = updatedCreatedBy.reduce((a, b) => {
    return new Date(a.date) > new Date(b.date) ? a : b;
  });

  return `${participantName} (${dayjs(date).locale(lang).format('D/M/YYYY')})`;
};

export const parseError = (
  error: 'unknown' | 'duplicate' | undefined,
  component: 'organizationUpdateCreate' | 'keywordTable',
  lang: LanguageKey,
  errorValue?: string
) => {
  if (!error) {
    return;
  }
  const translatedError = t.t(
    lang,
    (s) => s.components[component].errors[error]
  );
  if (error === 'duplicate' && errorValue) {
    return translatedError.replace(
      `${
        component === 'keywordTable' ? '{keywordName}' : '{organizationName}'
      }`,
      errorValue
    );
  }

  return translatedError;
};
