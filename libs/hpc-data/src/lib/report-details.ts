import * as t from 'io-ts';

export const SOURCE = t.union([t.literal('Primary'), t.literal('Secondary')]);

export const REPORT_DETAIL = t.type({
  id: t.number,
  flowID: t.number,
  versionID: t.number,
  contactInfo: t.union([t.string, t.null]),
  source: SOURCE,
  date: t.union([t.string, t.null]),
  sourceID: t.union([t.string, t.null]),
  refCode: t.union([t.string, t.null]),
  verified: t.boolean,
  organizationID: t.union([t.number, t.null]),
});
