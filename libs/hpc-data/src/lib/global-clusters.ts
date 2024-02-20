import * as t from 'io-ts';
import { FLOW_OBJECT } from './flowObject';

export const GLOBAL_CLUSTER = t.intersection([
  t.type({
    id: t.number,
    hrinfoId: t.union([t.number, t.null]),
    type: t.string,
    name: t.string,
    code: t.string,
    homepage: t.union([t.string, t.null]),
    defaultIconId: t.union([t.string, t.null]),
    parentId: t.union([t.number, t.null]),
    displayFTSSummariesFromYear: t.union([t.number, t.null]),
    createdAt: t.string,
    updatedAt: t.string,
  }),
  t.partial({
    flowObject: FLOW_OBJECT,
  }),
]);

export type GlobalCluster = t.TypeOf<typeof GLOBAL_CLUSTER>;

export const GET_GLOBAL_CLUSTERS_RESULT = t.array(GLOBAL_CLUSTER);
export type GetGlobalClustersResult = t.TypeOf<
  typeof GET_GLOBAL_CLUSTERS_RESULT
>;

export interface Model {
  getGlobalClusters(): Promise<GetGlobalClustersResult>;
}
