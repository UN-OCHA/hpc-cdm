import * as t from 'io-ts';
import { DATE_FROM_STRING, optional, type AbortSignalType } from './util';
import { CATEGORY_REF } from './category-refs';

export const CATEGORY_GROUP_TYPE = t.keyof({
  beneficiaryGroup: null,
  contributionStatus: null,
  contributionType: null,
  customLocation: null,
  earmarkingType: null,
  emergencyType: null,
  flowStatus: null,
  flowType: null,
  genderMarker: null,
  inactiveReason: null,
  keywords: null,
  method: null,
  organizationLevel: null,
  organizationType: null,
  pendingStatus: null,
  planClusterType: null,
  planCosting: null,
  planIndicated: null,
  planLanguage: null,
  planType: null,
  projectGrouping1: null,
  projectGrouping2: null,
  projectPriority: null,
  regions: null,
  reportChannel: null,
  responseType: null,
  sectorIASC: null,
  subsetOfPlan: null,
});

export type CategoryGroup = t.TypeOf<typeof CATEGORY_GROUP_TYPE>;
export const CATEGORY = t.type({
  id: t.number,
  name: t.string,
  group: CATEGORY_GROUP_TYPE,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  description: optional(t.string),
  parentID: optional(t.number),
  code: optional(t.string),
  includeTotals: optional(t.boolean),
});

export type Category = t.TypeOf<typeof CATEGORY>;

export const CATEGORY_WITH_CATEGORY_REF = t.type({
  ...CATEGORY.props,
  categoryRef: CATEGORY_REF,
});

export type CategoryWithCategoryRef = t.TypeOf<
  typeof CATEGORY_WITH_CATEGORY_REF
>;

export const KEYWORD = t.type({
  ...CATEGORY.props,
  refCount: t.string,
});

export type Keyword = t.TypeOf<typeof KEYWORD>;

const STATUS_OK = t.type({ status: t.keyof({ ok: 'ok' }) });

export const GET_CATEGORIES_PARAMS = t.type({
  query: CATEGORY_GROUP_TYPE,
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

export const DELETE_KEYWORD_RESULT = STATUS_OK;
export type DeleteKeywordResult = t.TypeOf<typeof DELETE_KEYWORD_RESULT>;

export const MERGE_KEYWORDS_PARAMS = t.type({
  receivingKeywordID: t.number,
  mergingKeywordID: t.number,
});
export type MergeKeywordParams = t.TypeOf<typeof MERGE_KEYWORDS_PARAMS>;

export const MERGE_KEYWORD_RESULT = STATUS_OK;
export type MergeKeywordResult = t.TypeOf<typeof MERGE_KEYWORD_RESULT>;

export interface Model {
  getCategories(params: GetCategoriesParams): Promise<GetCategoriesResult>;
  getKeywords(abortSignal?: AbortSignalType): Promise<GetKeywordsResult>;
  deleteKeyword(params: DeleteKeywordParams): Promise<DeleteKeywordResult>;
  updateKeyword(params: Keyword): Promise<Category>;
  mergeKeywords(params: MergeKeywordParams): Promise<MergeKeywordResult>;
}
