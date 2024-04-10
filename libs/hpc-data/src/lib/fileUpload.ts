import * as t from 'io-ts';

export const FILE_UPLOAD_RESULT = t.type({
  collection: t.string,
  createdAt: t.string,
  file: t.string,
  id: t.number,
  mimestype: t.string,
  name: t.string,
  originalname: t.string,
  self: t.string,
  size: t.number,
  updatedAt: t.string,
});

export type FileUploadResult = t.TypeOf<typeof FILE_UPLOAD_RESULT>;

export interface Model {
  fileUploadModel(file: File): Promise<FileUploadResult>;
}
