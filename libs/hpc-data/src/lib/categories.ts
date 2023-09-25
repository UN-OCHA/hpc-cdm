import * as t from 'io-ts';

export type CategoryGroup =
  | 'flowType'
  | 'keywords'
  | 'contributionType'
  | 'contributionStatus'
  | 'sectorIASC'
  | 'inactiveReason'
  | 'regions'
  | 'emergencyType'
  | 'planType'
  | 'organizationType'
  | 'planCosting'
  | 'reportChannel'
  | 'beneficiaryGroup'
  | 'genderMarker'
  | 'method'
  | 'customLocation'
  | 'projectPriority'
  | 'projectGrouping1'
  | 'projectGrouping2'
  | 'subsetOfPlan'
  | 'pendingStatus'
  | 'flowStatus'
  | 'responseType'
  | 'planIndicated'
  | 'earmarkingType'
  | 'organizationLevel';

const CATEGORY = t.type({
  id: t.number,
  name: t.string,
  description: t.union([t.string, t.null]),
  parentID: t.union([t.number, t.null]),
  code: t.union([t.string, t.null]),
  group: t.string,
  includeTotals: t.union([t.boolean, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
});

export type Category = t.TypeOf<typeof CATEGORY>;

export const GET_CATEGORIES_PARAMS = t.type({
  query: t.string,
});

export type GetCategoriesParams = t.TypeOf<typeof GET_CATEGORIES_PARAMS>;

export const GET_CATEGORIES_RESULT = t.array(CATEGORY);

export type GetCategoriesResult = t.TypeOf<typeof GET_CATEGORIES_RESULT>;

export interface Model {
  getCategories(params: GetCategoriesParams): Promise<GetCategoriesResult>;
}
