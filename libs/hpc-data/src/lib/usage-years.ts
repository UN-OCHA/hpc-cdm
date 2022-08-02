import * as t from 'io-ts';

export const USAGE_YEAR = t.type({
  id: t.number,
  year: t.string,
  createdAt: t.string,
  updatedAt: t.string,
});

export type UsageYear = t.TypeOf<typeof USAGE_YEAR>;

export const GET_USAGE_YEARS_RESULT = t.array(USAGE_YEAR);

export type GetUsageYearsResult = t.TypeOf<typeof GET_USAGE_YEARS_RESULT>;

export interface Model {
  getUsageYears(): Promise<GetUsageYearsResult>;
}
