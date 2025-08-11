import * as t from 'io-ts';
import { ISO_DATE_FROM_STRING, optional } from './util';

export const PROJECT_VERSION = t.type({
  id: t.number,
  version: t.number,
  projectId: t.number,
  name: t.string,
  code: t.string,
  editorParticipantId: optional(t.number),
  endDate: optional(ISO_DATE_FROM_STRING),
  startDate: optional(ISO_DATE_FROM_STRING),
  objective: optional(t.string),
  partners: optional(t.string),
  tags: optional(t.array(t.string)),
});
