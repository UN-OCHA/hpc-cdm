import { organizations } from '@unocha/hpc-data';
import { LanguageKey } from '../../i18n';
import dayjs from 'dayjs';

export const valueToInteger = (value: string | number) => {
  return typeof value === 'number' ? value : parseInt(value);
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
