import * as t from 'io-ts';
import { DATE_FROM_STRING, optional } from './util';

const GLOBAL_CLUSTER_TYPE = t.keyof({
  global: null,
  aor: null,
  custom: null,
});

export const GLOBAL_CLUSTER = t.type({
  id: t.number,
  type: GLOBAL_CLUSTER_TYPE,
  name: t.string,
  code: t.string,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  hrinfoId: optional(t.number),
  homepage: optional(t.string),
  parentId: optional(t.number),
  displayFTSSummariesFromYear: optional(t.number),
});

export type GlobalCluster = t.TypeOf<typeof GLOBAL_CLUSTER>;

export const GET_GLOBAL_CLUSTERS_RESULT = t.array(GLOBAL_CLUSTER);

export type GetGlobalClustersResult = t.TypeOf<
  typeof GET_GLOBAL_CLUSTERS_RESULT
>;

export interface Model {
  getGlobalClusters(): Promise<GetGlobalClustersResult>;
}
