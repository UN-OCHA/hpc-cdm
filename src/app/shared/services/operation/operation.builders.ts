/**
 * Responsible for building UI model objects with api responses.
 * Intended to decouple the api vs ui formats to provides a single point
 * of reference which should:
 * - simplify maintenance on any future api response updates/enhancements
 * - make obvious/transparent/traceable the data being used from each response
 * - increase code testability 
 */
import { Operation, Entity, EntityPrototype, Attachment } from './operation.models';
import * as moment from 'moment';

export function buildOperation(op: any): Operation {
  const v = op.operationVersion;
  return {
    version: v.code,
    name: v.name,
    description: v.description
  }
}

export function buildAttachment(att: any, report?: any): Attachment {
  const v = att.opAttachmentVersion;
  const value = report
    && report.dataReportVersion
    && report.dataReportVersion.value;
  const finalized = value && value.finalized;
  const comments = value && value.comments;
  return {
    id: att.id,
    status: !report ? 0 : !finalized ? 1 : 2,
    versionId: v.id,
    formId: v.customReference,
    formName: v.value.name,
    formFile: v.value.file,
    comments
  };
}

const ENTITY_NAME_LIMIT = 10;
export function buildEntity(ge, v): Entity {
  const ta = v.technicalArea;
  const limit = ENTITY_NAME_LIMIT;
  const tooLong = ta.length > limit;
  let name = ta.slice(0,  tooLong ? limit : ta.length);
  name += tooLong ? '...' : '';
  return {
    id: ge.id,
    versionId: v.id,
    name,
    technicalArea: v.technicalArea,
    icon: v.icon,
    activationDate: moment(v.activationDate).toDate(),
    deactivationDate: moment(v.deactivationDate).toDate(),
    activationLetter: v.activationLetter,
    deactivationLetter: v.deactivationLetter,
    notes: v.notes
  };
}

export function buildEntityPrototype(ep: any): EntityPrototype {
  const version = ep.opEntityPrototypeVersion;
  return {
    id: ep.id,
    type: version.type,
    refCode: version.refCode,
    value: version.value,
  }
}
