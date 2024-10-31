import * as t from 'io-ts';
import type { AbortSignalType } from './util';

const CATEGORY_GROUP = t.keyof({
  flowType: t.null,
  keywords: t.null,
  contributionType: t.null,
  contributionStatus: t.null,
  sectorIASC: t.null,
  inactiveReason: t.null,
  regions: t.null,
  emergencyType: t.null,
  planType: t.null,
  organizationType: t.null,
  planCosting: t.null,
  reportChannel: t.null,
  beneficiaryGroup: t.null,
  genderMarker: t.null,
  method: t.null,
  customLocation: t.null,
  projectPriority: t.null,
  projectGrouping1: t.null,
  projectGrouping2: t.null,
  subsetOfPlan: t.null,
  pendingStatus: t.null,
  flowStatus: t.null,
  responseType: t.null,
  planIndicated: t.null,
  earmarkingType: t.null,
  organizationLevel: t.null,
});

export type CategoryGroup = t.TypeOf<typeof CATEGORY_GROUP>;
export const CATEGORY = t.type({
  id: t.number,
  name: t.string,
  description: t.union([t.string, t.null]),
  parentID: t.union([t.number, t.null]),
  code: t.union([t.string, t.null]),
  group: CATEGORY_GROUP,
  includeTotals: t.union([t.boolean, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
});

export type Category = t.TypeOf<typeof CATEGORY>;

export const KEYWORD = t.type({
  ...CATEGORY.props,
  refCount: t.string,
});

export type Keyword = t.TypeOf<typeof KEYWORD>;

export const GET_CATEGORIES_PARAMS = t.type({
  query: CATEGORY_GROUP,
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

export const MERGE_KEYWORDS_PARAMS = t.type({
  receivingKeywordID: t.number,
  mergingKeywordID: t.number,
});
export type MergeKeywordParams = t.TypeOf<typeof MERGE_KEYWORDS_PARAMS>;

export const MERGE_KEYWORD_RESULT = t.undefined;
export type MergeKeywordResult = t.TypeOf<typeof MERGE_KEYWORD_RESULT>;

export interface Model {
  getCategories(params: GetCategoriesParams): Promise<GetCategoriesResult>;
  getKeywords(abortSignal?: AbortSignalType): Promise<GetKeywordsResult>;
  deleteKeyword(params: DeleteKeywordParams): Promise<DeleteKeywordResult>;
  updateKeyword(params: Keyword): Promise<Category>;
  mergeKeywords(params: MergeKeywordParams): Promise<MergeKeywordResult>;
}
