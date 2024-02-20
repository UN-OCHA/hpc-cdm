import * as t from 'io-ts';

const FLOW_REF_DIRECTION = t.keyof({
  source: null,
  destination: null,
});

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
