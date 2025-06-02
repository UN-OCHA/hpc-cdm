import * as t from 'io-ts';
import { DATE_FROM_STRING } from './util';

export const USAGE_YEAR = t.type({
  id: t.number,
  year: t.string,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
});

export type UsageYear = t.TypeOf<typeof USAGE_YEAR>;

export const GET_USAGE_YEARS_RESULT = t.array(USAGE_YEAR);
export type GetUsageYearsResult = t.TypeOf<typeof GET_USAGE_YEARS_RESULT>;

export const GET_USAGE_YEARS_AUTOCOMPLETE_PARAMS = t.type({
  query: t.string,
});
export type GetUsageYearsAutocompleteParams = t.TypeOf<
  typeof GET_USAGE_YEARS_AUTOCOMPLETE_PARAMS
>;
export interface Model {
  getUsageYears(): Promise<GetUsageYearsResult>;
  getAutocompleteUsageYears(
    params: GetUsageYearsAutocompleteParams
  ): Promise<GetUsageYearsResult>;
}
