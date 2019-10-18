export interface Operation {
  id?: number;
  version?: string;
  name: string;
  description?: string;
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
}
