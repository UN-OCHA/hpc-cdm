import * as t from 'io-ts';
import { FILE_ASSET_ENTITY } from './file-asset-entities';
import { optional } from './util';

const REPORT_FILE_TYPE = t.keyof({
  file: null,
  URL: null,
  url: null,
});

const REPORT_FILE = t.type({
  id: t.number,
  reportID: t.number,
  title: t.string,
  type: REPORT_FILE_TYPE,
  url: optional(t.string),
  fileAssetID: optional(t.number),
});

export const CREATE_FILE = t.type({
  title: REPORT_FILE.props.title,
  type: REPORT_FILE.props.type,
  url: REPORT_FILE.props.url,
  fileAssetID: REPORT_FILE.props.fileAssetID,
});
export type CreateFile = t.TypeOf<typeof CREATE_FILE>;

export const REPORT_FILE_WITH_ENTITY = t.type({
  ...REPORT_FILE.props,
  fileAssetEntity: optional(FILE_ASSET_ENTITY),
});
