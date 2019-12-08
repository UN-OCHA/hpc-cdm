/**
 * Responsible for building UI model objects with api responses.
 * Intended to decouple the api vs ui formats to provides a single point
 * of reference which should:
 * - simplify maintenance on any future api response updates/enhancements
 * - make obvious/transparent/traceable the data being used from each response
 * - increase code testability
 */
import { User, Operation, Entity, EntityPrototype,
  Attachment, AttachmentPrototype } from './data';
import * as moment from 'moment';

const ADMIN_ROLES = ['rpmadmin', 'hpcadmin'];


export function buildUser(participant: any): User {
  const roles = (participant && participant.roles) || [];
  const adminRoles = roles.find(r => ADMIN_ROLES.includes(r.name));
  // console.log(participant)
  return {
    id: participant.id,
    email: participant.email,
    isAdmin: adminRoles != undefined
  }
}

export function buildOperation(op: any): Operation {
  const v = op.operationVersion;
  // console.log(op)
  let attachmentPrototypes = [];
  let attachmentPrototype = null;
  if(op.opAttachmentPrototypes) {
    attachmentPrototypes =
      op.opAttachmentPrototypes.map(p => buildAttachmentPrototype(p));
    attachmentPrototype =
      attachmentPrototypes.find(ap => ap.entities.includes('OP'));
  }
  const entityPrototypes =
    op.opEntityPrototypes.map(p => buildEntityPrototype(p, attachmentPrototypes));
  return {
    id: op.id,
    version: v.code,
    name: v.name,
    description: v.description,
    entityPrototypes,
    attachmentPrototypes,
    attachmentPrototype, // Operation Attachment
    updatedAt: op.updatedAt,
    starred: true
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

export function buildEntityPrototype(ep: any, aprototypes=[]): EntityPrototype {
  const version = ep.opEntityPrototypeVersion;
  // console.log('---------------------------------------------')
  // console.log(ep)
  const attachmentPrototype = aprototypes.find(p => p.entities.includes(version.refCode));
  return {
    id: ep.id,
    type: version.type,
    refCode: version.refCode,
    value: version.value,
    name: version.value.name,
    attachmentPrototype
  }
}

export function buildAttachmentPrototype(ep: any): AttachmentPrototype {
  const version = ep.opAttachmentPrototypeVersion;
  return {
    id: ep.id,
    type: version.type,
    refCode: version.refCode,
    value: version.value,
    entities: version.value.entities,
    name: version.value.name
  }
}
