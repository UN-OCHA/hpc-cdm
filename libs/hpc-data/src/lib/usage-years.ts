import * as t from 'io-ts';

const USAGE_YEAR = t.type({
  id: t.number,
  year: t.string,
  createdAt: t.string,
  updatedAt: t.string,
});

const GET_USAGE_YEARS_AUTOCOMPLETE_PARAMS = t.type({
  search: t.string,
});

export type UsageYear = t.TypeOf<typeof USAGE_YEAR>;

export const GET_USAGE_YEARS_RESULT = t.array(USAGE_YEAR);

export type GetUsageYearsAutocompleteParams = t.TypeOf<
  typeof GET_USAGE_YEARS_AUTOCOMPLETE_PARAMS
>;

export type GetUsageYearsResult = t.TypeOf<typeof GET_USAGE_YEARS_RESULT>;

export interface Model {
  getUsageYearsAutocomplete(
    params: GetUsageYearsAutocompleteParams
  ): Promise<GetUsageYearsResult>;
}
