import * as t from 'io-ts';
import { optional } from './util';

export const FLOW_OBJECT_OBJECT_TYPE = t.keyof({
  anonymizedOrganization: null,
  cluster: null,
  corePlanEntityActivity: null,
  corePlanEntityObjective: null,
  emergency: null,
  flow: null,
  globalCluster: null,
  governingEntity: null,
  location: null,
  organization: null,
  plan: null,
  planEntity: null,
  project: null,
  usageYear: null,
});

const FLOW_OBJECT_BEHAVIOR = t.keyof({
  overlap: null,
  shared: null,
});

export const FLOW_OBJECT_REF_DIRECTION = t.keyof({
  source: null,
  destination: null,
});

export const FLOW_OBJECT = t.type({
  flowID: t.number,
  objectID: t.number,
  objectType: FLOW_OBJECT_OBJECT_TYPE,
  refDirection: FLOW_OBJECT_REF_DIRECTION,
  versionID: t.number,
  behavior: optional(FLOW_OBJECT_BEHAVIOR),
  objectDetail: optional(t.string),
});

export type FlowObject = t.TypeOf<typeof FLOW_OBJECT>;
