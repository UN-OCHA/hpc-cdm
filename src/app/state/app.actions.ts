import {
  // App,
  Operation,
  Attachment
} from './app.interfaces';

// Get Operation
export class GetOperation {
  static readonly type = '[API] GET_OP';
  constructor(public payload: any) { }
}

export class GetOperationSucess {
  static readonly type = '[API] GET_OP_SUCCESS';
  constructor(public payload: Operation) { }
}

export class GetOperationFailed {
  static readonly type = '[API] GET_OP_FAILED';
  constructor(public payload?: any) { }
}

// Get Operation Attachments
export class GetOperationAttachments {
  static readonly type = '[API] GET_OP_ATTACHMENTS';
  constructor(public payload?: any) { }
}

export class GetOperationAttachmentsSuccess {
  static readonly type = '[API] GET_OP_ATTACHMENTS_SUCCESS';
  constructor(public payload: Attachment[]) { }
}

export class GetOperationAttachmentsFailed {
  static readonly type = '[API] GET_OP_ATTACHMENTS_FAILED';
  constructor(public payload?: any) { }
}
