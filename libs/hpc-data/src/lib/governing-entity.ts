import * as t from 'io-ts';

export const GoverningEntityVersion = t.type({
  id: t.number,
  governingEntityId: t.number,
  name: t.string,
  customReference: t.string,
  overriding: t.boolean,
  tags: t.union([t.string, t.null]),
  currentVersion: t.boolean,
  latestVersion: t.boolean,
  latestTaggedVersion: t.boolean,
  versionTags: t.union([t.array(t.string), t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  clusterNumber: t.string,
});

export const GOVERNING_ENTITY_DETAIL = t.type({
  id: t.number,
  createdAt: t.string,
  currentVersion: t.boolean,
  deletedAt: t.union([t.string, t.null]),
  entityPrototypeId: t.number,
  entityType: t.string,
  governingEntityVersion: GoverningEntityVersion,
  globalClusterIds: t.array(t.union([t.string, t.number])),
  latestTaggedVersion: t.boolean,
  latestVersion: t.boolean,
  planId: t.number,
  updatedAt: t.string,
  versionTags: t.array(t.string),
});
export type GoverningEntity = t.TypeOf<typeof GOVERNING_ENTITY_DETAIL>;

export const GET_GOVERNING_ENTITY_PARAMS = t.type({
  id: t.number,
});

export type GetGoverningEntityParams = t.TypeOf<
  typeof GET_GOVERNING_ENTITY_PARAMS
>;
export const GET_GOVERNING_ENTITIES_RESULT = t.array(GOVERNING_ENTITY_DETAIL);

export const GET_GOVERNING_ENTITIES_RESULT_OBJECT = t.type({
  governingEntities: GET_GOVERNING_ENTITIES_RESULT,
});

export type GetGoverningEntityResult = t.TypeOf<
  typeof GET_GOVERNING_ENTITIES_RESULT
>;

export type GetGoverningEntityResultObject = t.TypeOf<
  typeof GET_GOVERNING_ENTITIES_RESULT_OBJECT
>;

export interface Model {
  getAllPlanGoverningEntities(
    params: GetGoverningEntityParams
  ): Promise<GetGoverningEntityResult>;
  getGoverningEntities(
    params: GetGoverningEntityParams
  ): Promise<GetGoverningEntityResult>;
}
