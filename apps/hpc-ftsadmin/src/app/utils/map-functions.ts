import { organizations, FormObjectValue } from '@unocha/hpc-data';
import { LanguageKey } from '../../i18n';
import dayjs from 'dayjs';

export const valueToInteger = (value: string | number) => {
  return typeof value === 'number' ? value : parseInt(value);
};

export const currencyToInteger = (value: string) => {
  return parseInt(value.replace(',', ''));
};

export const formValueToID = (items: Array<FormObjectValue>): number[] => {
  return items.map((item) => valueToInteger(item.value));
};

export const formValueToLabel = (items: Array<FormObjectValue>): string[] => {
  return items.map((item) => item.displayLabel);
};

export const camelCaseToTitle = (word: string): string => {
  const addSpaces = word.replace(/([A-Z]+)/g, ' $1');
  return addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);
};

export const stringToPendingFlowSelect = (
  items: string[]
): { id: number; versionID: number }[] => {
  return items.map((x) => JSON.parse(x) as { id: number; versionID: number });
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
