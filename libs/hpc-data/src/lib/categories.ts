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

export const CATEGORY = t.type({
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

export const KEYWORD = t.type({
  id: t.number,
  name: t.string,
  description: t.union([t.string, t.null]),
  parentID: t.union([t.number, t.null]),
  code: t.union([t.string, t.null]),
  group: t.string,
  includeTotals: t.union([t.boolean, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  refCount: t.string,
});

export type Keyword = t.TypeOf<typeof KEYWORD>;

export const GET_CATEGORIES_PARAMS = t.type({
  query: t.string,
});

export type GetCategoriesParams = t.TypeOf<typeof GET_CATEGORIES_PARAMS>;

export const GET_CATEGORIES_RESULT = t.array(CATEGORY);

export type GetCategoriesResult = t.TypeOf<typeof GET_CATEGORIES_RESULT>;

export const GET_KEYWORDS_RESULT = t.array(KEYWORD);

export type GetKeywordsResult = t.TypeOf<typeof GET_KEYWORDS_RESULT>;

export const DELETE_KEYWORD_PARAMS = t.type({
  id: t.number,
});
export type DeleteKeywordParams = t.TypeOf<typeof DELETE_KEYWORD_PARAMS>;

export const DELETE_KEYWORD_RESULT = t.undefined;
export type DeleteKeywordResult = t.TypeOf<typeof DELETE_KEYWORD_RESULT>;

export interface Model {
  getCategories(params: GetCategoriesParams): Promise<GetCategoriesResult>;
  getKeywords(): Promise<GetKeywordsResult>;
  deleteKeyword(params: DeleteKeywordParams): Promise<DeleteKeywordResult>;
  updateKeyword(params: Keyword): Promise<Category>;
}
