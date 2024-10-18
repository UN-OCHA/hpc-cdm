import * as t from 'io-ts';
import { GLOBAL_CLUSTER } from './global-clusters';

export const GOVERNING_ENTITY = t.type({
  id: t.number,
  planId: t.number,
  entityPrototypeId: t.number,
});

export type GoverningEntity = t.TypeOf<typeof GOVERNING_ENTITY>;

export const GOVERNING_ENTITY_VERSION = t.type({
  id: t.number,
  governingEntityId: t.number,
  name: t.string,
  customReference: t.string,
});

export type GoverningEntityVersion = t.TypeOf<typeof GOVERNING_ENTITY_VERSION>;

const GET_GOVERNING_ENTITY_PARAMS = t.type({
  id: t.number,
});

export type GetGoverningEntityParams = t.TypeOf<
  typeof GET_GOVERNING_ENTITY_PARAMS
>;

export const GET_GOVERNING_ENTITY_RESULT = t.intersection([
  GOVERNING_ENTITY,
  t.type({
    governingEntityVersion: GOVERNING_ENTITY_VERSION,
    globalClusters: t.array(GLOBAL_CLUSTER),
  }),
]);

export type GetGoverningEntityResult = t.TypeOf<
  typeof GET_GOVERNING_ENTITY_RESULT
>;
export interface Model {
  getGoverningEntity(
    params: GetGoverningEntityParams
  ): Promise<GetGoverningEntityResult>;
}
