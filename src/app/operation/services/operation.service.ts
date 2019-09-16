import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { ApiService } from 'app/shared/services/api/api.service';

export interface Attachment {
  id?: any;
  formId: any;
  formName: any;
  formFileId?: number;
  formFilePath?: string;
  formFileName?: string;
}

@Injectable({providedIn: 'root'})
export class OperationService {
  api: ApiService;
  public operation: any;

  private readonly _attachments = new BehaviorSubject<Attachment[]>([]);
  readonly attachments$ = this._attachments.asObservable();

  constructor(api: ApiService) {
    this.api = api;
  }

  get attachments(): Attachment[] {
    return this._attachments.getValue();
  }

  set attachments(val: Attachment[]) {
    this._attachments.next(val);
  }

  async addAttachment(attachment: Attachment, operationId?: any) {
    if(attachment) {
      try {
        this.api.saveOperationAttachment({
          objectId: operationId,
          objectType:'operation',
          opAttachmentPrototypeId:1,
          type: 'form',
          opAttachmentVersion: {
            customReference: attachment.formId,
            value: {
              name: attachment.formName,
              file: attachment.formFilePath,
              fileId: attachment.formFileId,
              fileName: attachment.formFileName
            }
          }
        }, operationId).subscribe(response => {
          const idx = this.attachments.indexOf(this.attachments.find(a => !a.id));
          attachment.id = response.id;
          this.attachments[idx] = {...attachment};
          this.attachments = [...this.attachments];
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  async removeAttachment(id: any) {
    // optimistic update
    const attachment = this.attachments.find(a => a.id === id);
    this.attachments = this.attachments.filter(a => a.id !== id);
    try {
      this.api.deleteOperationAttachment(id).subscribe(response => {
        if(response.status !== 'ok') {
          throw new Error('Unable to delete attachment');
        }
      });
    } catch (e) {
      console.error(e);
      this.attachments = [...this.attachments, attachment];
    }
  }

  public getAttachments(operationId: number) {
    this.api.getOperationAttachments(operationId).subscribe(response => {
      this.attachments = response.opAttachments.map(a => {
        const v = a.opAttachmentVersion;
        v.value.attachmentId = a.id;
        return {
          id: a.id,
          formId: v.customReference,
          formName: v.value.name,
          formFileId: v.value.fileId,
          formFileName: v.value.fileName,
          formFilePath: v.value.file
        };
      });
    });
  }
}
