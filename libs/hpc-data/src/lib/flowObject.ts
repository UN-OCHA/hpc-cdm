import * as t from 'io-ts';

export const FLOW_REF_DIRECTION = t.union([
  t.literal('source'),
  t.literal('destination'),
]);

export const FLOW_OBJECT = t.intersection([
  t.type({
    objectID: t.number,
    refDirection: FLOW_REF_DIRECTION,
    objectType: t.string,
  }),
  t.partial({
    flowID: t.number,
    versionID: t.number,
    behavior: t.union([t.string, t.null]),
    objectDetail: t.union([t.string, t.null]),
    createdAt: t.string,
    updatedAt: t.string,
  }),
]);

export const FLOW_OBJECT_TYPE = t.intersection([
  t.type({
    implementingPartner: t.union([t.string, t.null, t.undefined]),
    id: t.number,
    name: t.string,
  }),
  t.partial({
    behavior: t.string,
    objectDetail: t.union([t.string, t.null]),
    cleared: t.boolean,
    restricted: t.boolean,
  }),
]);

export type flowObjectType = t.TypeOf<typeof FLOW_OBJECT_TYPE>;
