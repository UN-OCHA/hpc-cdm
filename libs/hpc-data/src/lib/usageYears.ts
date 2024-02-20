import * as t from 'io-ts';
import { FLOW_OBJECT } from './flowObject';

export const USAGE_YEAR = t.intersection([
  t.type({
    id: t.number,
    year: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    flowObject: FLOW_OBJECT,
  }),
]);

export type UsageYear = t.TypeOf<typeof USAGE_YEAR>;

export const GET_USAGE_YEARS_RESULT = t.array(USAGE_YEAR);
export type GetUsageYearsResult = t.TypeOf<typeof GET_USAGE_YEARS_RESULT>;

export interface Model {
  getUsageYears(): Promise<GetUsageYearsResult>;
}
