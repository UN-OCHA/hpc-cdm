import * as t from 'io-ts';
import { DATE_FROM_STRING } from './util';

export const CURRENCY = t.type({
  id: t.number,
  code: t.string,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
});

export const GET_CURRENCIES_RESULT = t.array(CURRENCY);

export type GetCurrenciesResult = t.TypeOf<typeof GET_CURRENCIES_RESULT>;

export interface Model {
  getCurrencies(): Promise<GetCurrenciesResult>;
}
