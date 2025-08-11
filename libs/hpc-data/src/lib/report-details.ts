import * as t from 'io-ts';
import { DATE_FROM_STRING, optional } from './util';

const SOURCE = t.keyof({
  Primary: null,
  Secondary: null,
});

export const REPORT_DETAIL = t.type({
  id: t.number,
  flowID: t.number,
  source: SOURCE,
  verified: t.boolean,
  versionID: t.number,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  contactInfo: optional(t.string),
  date: optional(DATE_FROM_STRING),
  organizationID: optional(t.number),
  refCode: optional(t.string),
  sourceID: optional(t.string),
});
