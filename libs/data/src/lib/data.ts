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
  entityPrototypes?: EntityPrototype[];
  updatedAt?: any;
}

export interface Attachment {
  id?: any;
  versionId?: any;
  status?: any;
  formId: any;
  formName: any;
  formFile: any;
  comments?: any;
}

export interface AttachmentPrototype {
  id: number;
  value: any;
  type: string;
  refCode: string;
  name: any;
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
