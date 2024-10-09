import * as t from 'io-ts';
import { FILE_ASSET_ENTITY } from './file-asset-entities';

const REPORT_FILE_TYPE = t.union([
  t.literal('file'),
  t.literal('URL'),
  t.literal('url'),
]);

const REPORT_FILE = t.type({
  id: t.number,
  reportID: t.number,
  title: t.string,
  type: REPORT_FILE_TYPE,
  url: t.union([t.string, t.null]),
  fileAssetID: t.union([t.number, t.null]),
});

export const CREATE_FILE = t.type({
  title: t.string,
  type: REPORT_FILE_TYPE,
  url: t.union([t.string, t.null]),
  fileAssetID: t.union([t.number, t.null]),
});
export type CreateFile = t.TypeOf<typeof CREATE_FILE>;

export const REPORT_FILE_WITH_ENTITY = t.intersection([
  REPORT_FILE,
  t.type({
    fileAssetEntity: t.union([FILE_ASSET_ENTITY, t.null]),
  }),
]);
