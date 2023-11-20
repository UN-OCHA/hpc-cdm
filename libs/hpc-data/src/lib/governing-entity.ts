import * as t from 'io-ts';

export const GOVERNING_ENTITY_DETAIL = t.type({
  composedReference: t.string,
  createdAt: t.string,
  currentVersion: t.boolean,
  deletedAt: t.union([t.string, t.null]),
  editableByUser: t.boolean,
  entityPrototypeId: t.number,
  entityType: t.string,
  globalClusterIds: t.array(t.string),
  id: t.number,
  latestTaggedVersion: t.boolean,
  latestVersion: t.boolean,
  planId: t.number,
  updatedAt: t.string,
  versionTags: t.array(t.string),
});

export const GET_GOVERNING_ENTITY_PARAMS = t.type({
  id: t.number,
});

export type GetGoverningEntityParams = t.TypeOf<
  typeof GET_GOVERNING_ENTITY_PARAMS
>;

export type GetGoverningEntityResult = t.TypeOf<typeof GOVERNING_ENTITY_DETAIL>;

export interface Model {
  getAllPlanGoverningEntities(
    params: GetGoverningEntityParams
  ): Promise<GetGoverningEntityResult>;
}
