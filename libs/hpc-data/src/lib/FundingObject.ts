import { id } from 'fp-ts/lib/Refinement';
import * as t from 'io-ts';

export const FORM_ITEM = t.intersection([
  t.type({
    id: t.union([t.string, t.number]),
    name: t.string,
  }),
  t.partial({
    value: t.union([t.string, t.number]),
    displayLabel: t.string,
    behavior: t.string,
    objectDetail: t.union([t.string, t.null]),
    cleared: t.boolean,
    restricted: t.union([t.boolean, t.undefined]),
    implementingPartner: t.union([t.string, t.null]),
  }),
]);
export const FUNDING_DETAIL = t.type({
  governingEntity: t.array(FORM_ITEM),
  location: t.array(FORM_ITEM),
  organization: t.array(FORM_ITEM),
  project: t.array(FORM_ITEM),
  usageYear: t.array(FORM_ITEM),
  globalCluster: t.array(FORM_ITEM),
  emergency: t.array(FORM_ITEM),
  plan: t.array(FORM_ITEM),
});
export const FUNDING_OBJECT = t.type({
  src: FUNDING_DETAIL,
  dest: FUNDING_DETAIL,
});

export type fundingObjectType = t.TypeOf<typeof FUNDING_OBJECT>;
