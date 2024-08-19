import { organizations } from '@unocha/hpc-data';
import { LanguageKey, t } from '../../i18n';
import dayjs from 'dayjs';

export const valueToInteger = (value: string | number) => {
  return typeof value === 'number' ? value : parseInt(value);
};

export const currencyToInteger = (value: string) => {
  return parseInt(value.replace(/,/g, ''));
};

export const parseUpdatedCreatedBy = (
  updatedCreatedBy: Array<organizations.UpdatedCreatedBy>,
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
  error: 'unknown' | 'duplicate' | 'conflict' | undefined,
  component: 'organizationUpdateCreate' | 'keywordTable',
  lang: LanguageKey,
  errorValue?: string
) => {
  if (!error) {
    return undefined;
  }
  const translatedError = t.t(lang, (s) => {
    if (component === 'keywordTable' && error !== 'conflict') {
      return s.components[component].errors[error];
    } else if (component === 'organizationUpdateCreate') {
      return s.components[component].errors[error];
    }
    return s.components[component].errors.unknown;
  });
  
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
