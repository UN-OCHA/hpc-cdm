import * as t from 'io-ts';

export const CURRENCY = t.type({
  id: t.number,
  code: t.string,
  createdAt: t.string,
  updatedAt: t.string,
});

export type Currency = t.TypeOf<typeof CURRENCY>;

export const GET_CURRENCIES_RESULT = t.array(CURRENCY);
export type GetCurrenciesResult = t.TypeOf<typeof GET_CURRENCIES_RESULT>;

export interface Model {
  getCurrencies(): Promise<GetCurrenciesResult>;
}
