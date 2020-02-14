/**
 * Responsible for building UI model objects with api responses.
 * Intended to decouple the api vs ui formats to provides a single point
 * of reference which should:
 * - simplify maintenance on any future api response updates/enhancements
 * - make obvious/transparent/traceable the data being used from each response
 * - increase code testability
 */
<<<<<<< HEAD
import { User, Operation, Entity, EntityPrototype,
  Blueprint, Location, ReportingWindow,
  Attachment, AttachmentPrototype } from './data';
=======
import {
  User, Operation, Entity, EntityPrototype,
  Attachment, AttachmentPrototype
} from './data';
>>>>>>> cdm-dev
import * as moment from 'moment';

const ADMIN_ROLES = ['rpmadmin', 'operationLead'];


export function buildUser(participant: any): User {
  const roles = (participant && participant.roles) || [];
  const adminRoles = roles.find(r => ADMIN_ROLES.includes(r.name));
  return {
    id: participant.id,
    email: participant.email,
    isAdmin: adminRoles != undefined
  }
}

export function buildOperation(op: any): Operation {
  const v = op.operationVersion;
  let attachmentPrototypes = [];
  let attachmentPrototype = null;
  if (op.opAttachmentPrototypes) {
    attachmentPrototypes =
      op.opAttachmentPrototypes.map(p => buildAttachmentPrototype(p));
    attachmentPrototype =
      attachmentPrototypes.find(p => p.entities && p.entities.includes('OP'));
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
    emergencies: op.emergencies,
    locations: op.locations,
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
    comments,
    collection: 'forms',
    opAttachmentPrototypeId: att.opAttachmentPrototypeId,
    operationId: att.operationId,
    opAttachmentVersion: v,
    objectId: att.objectId,
    objectType: att.objectType

  };
}

export function buildLocation(l: any): Location {
  return {
    id: l.id,
    name: l.name
  }
}

export function buildEmergency(e: any): Location {
  return {
    id: e.id,
    name: e.name
  }
}

const ENTITY_NAME_LIMIT = 10;
export function buildEntity(ge, v): Entity {
  const ta = v.technicalArea;
  const limit = ENTITY_NAME_LIMIT;
  const tooLong = ta.length > limit;
  let name = ta.slice(0, tooLong ? limit : ta.length);
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

export function buildEntityPrototype(ep: any, aprototypes = []): EntityPrototype {
  const version = ep.opEntityPrototypeVersion;
  const attachmentPrototype = aprototypes.find(p => p.entities && p.entities.includes(version.refCode));
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

export function buildBlueprint(bp: any): Blueprint {
  return {
    id: bp.id,
    name: bp.name,
    description: bp.description,
    model: bp.model,
    type: bp.type,
    status: bp.status,
    createdAt: bp.createdAt,
    updatedAt: bp.updatedAt
  }
}

export function buildReportingWindow(rw: any): ReportingWindow {
  return {
    id: rw.id,
    name: 'xxx',//rw.value.name,
    description: 'yyy',//rw.value.description,
    status: 'zzz', //rw.status,
    startDate: rw.startDate,
    endDate: rw.endDate,
    createdAt: rw.createdAt,
    updatedAt: rw.updatedAt,
    value: rw.value
  }
}
