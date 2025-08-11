import * as t from 'io-ts';
import { FLOW_OBJECT_REF_DIRECTION } from './flow-objects';
import { DATE_FROM_STRING, optional } from './util';

const EXTERNAL_DATA_SYSTEM_ID = t.keyof({
  CERF: null,
  EDRIS: null,
  Excel: null,
  IATI: null,
  OCT: null,
  'OCT-CERF': null,
  'OCT-CBPF': null,
  'OCT-OCHA': null,
  'OneGMS-CBPF': null,
  'OneGMS-CERF': null,
});

const EXTERNAL_DATA_OBJECT_TYPE = t.keyof({
  emergency: null,
  globalCluster: null,
  linkedFlow: null,
  location: null,
  organization: null,
  plan: null,
  project: null,
});

export const EXTERNAL_DATA = t.type({
  id: t.number,
  systemID: EXTERNAL_DATA_SYSTEM_ID,
  flowID: t.number,
  versionID: t.number,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  data: t.string,
  objectType: EXTERNAL_DATA_OBJECT_TYPE,
  externalRefID: optional(t.string),
  externalRefDate: optional(DATE_FROM_STRING),
  matched: optional(t.boolean),
  refDirection: optional(FLOW_OBJECT_REF_DIRECTION),
});
