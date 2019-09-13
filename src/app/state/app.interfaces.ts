export interface App {
  operation: Operation;
  operationAttachments: Attachment[];
}

export interface Operation {
  id: number;
  name: String;
}

export interface Attachment {
  id: number;
  name: String;
}
