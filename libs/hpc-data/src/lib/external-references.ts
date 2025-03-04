import * as t from 'io-ts';
import { DATE_FROM_STRING, optional } from './util';

const IMPORT_INFORMATION = t.partial({
  inferred: t.array(
    t.intersection([
      t.type({
        key: t.string,
        reason: t.string,
      }),
      t.partial({
        //  TODO: Change to `t.number` when data corruption is fixed
        valueId: t.any,
      }),
    ])
  ),
  transferred: t.array(
    t.intersection([
      t.type({
        key: t.string,
      }),
      t.partial({
        //  TODO: Change to `t.number` when data corruption is fixed
        valueId: t.any,
      }),
    ])
  ),
});

export const EXTERNAL_REFERENCE = t.type({
  id: t.number,
  systemID: t.string,
  flowID: t.number,
  externalRecordID: t.string,
  externalRecordDate: DATE_FROM_STRING,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  importInformation: optional(IMPORT_INFORMATION),
  versionID: optional(t.number),
});
