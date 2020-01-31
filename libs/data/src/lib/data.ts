export interface User {
  id: number;
  email: string;
  isAdmin: boolean;
}

export interface Operation {
  id?: number;
  version?: string;
  name: string;
  description?: string;
  entityPrototypes: EntityPrototype[];
  attachmentPrototypes: AttachmentPrototype[];
  attachmentPrototype?: AttachmentPrototype;
  emergencies: any,
  locations: any;
  updatedAt?: any;
  starred: boolean;
}

export interface Attachment {
  id?: any;
  versionId?: any;
  status?: any;
  formId: any;
  formName: any;
  formFile: any;
  comments?: any;
  collection:any;
  opAttachmentPrototypeId:any;
  operationId:any;
  opAttachmentVersion:any;
  objectId:any;
  objectType:any;
}

export interface AttachmentPrototype {
  id: number;
  value: any;
  type: string;
  refCode: string;
  name: any;
  entities: string[];
}

export interface Entity {
  id?: any;
  versionId?: any;
  name?: any;
  icon?: any;
  technicalArea: any;
  activationDate: any;
  deactivationDate: any;
  activationLetter: any;
  deactivationLetter: any;
  notes: string;
}

export interface EntityPrototype {
  id: number;
  value: any;
  type: string;
  refCode: string;
  name: any;
  attachmentPrototype?: AttachmentPrototype;
}

export interface ReportingWindow {
    exists: boolean;
    id: number;
    value: any;
    creatorParticipantId: number;
    operationId: number;
    planId: number;
    status: string;
    context: any;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    editableByUser: boolean;
}
// this.createdAt = moment(options.createdAt).toDate();
// this.updatedAt = moment(options.updatedAt).toDate();
