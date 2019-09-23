import * as moment from 'moment';

import { ModelExtender } from 'app/operation/models/model-extender.model';

export class Operation extends ModelExtender {
  public exists = false;
  public id: number;
  public code: string;
  public version: number;
  public routeStepsGenerated: boolean;

  public operationVersion: any;
  public emergencies: Array<any>;
  public locations: Array<any>;
  public opEntityPrototypes: Array<any>;
  public opAttachmentPrototypes: Array<any>;
  public opGoverningEntities: Array<GoverningEntity>
  public opAttachments: Array<Attachment>;
  public name: string;

  public creatorParticipantId: number;
  public lastUpdated: any;
  public created: any;

  public createdAt: Date;
  public updatedAt: Date;

  public editableByUser = false;

  // TODO: Clean up this constructor
  constructor (options) {
    super();

    Object.assign(this, options);

    this.createdAt = moment(options.createdAt).toDate();
    this.updatedAt = moment(options.updatedAt).toDate();
    this.opGoverningEntities = options.opGoverningEntities;

  }

  public getDisplayName () {
    let shortDisplayText = this.code;
    if (this.name && this.name.length > 0) {
      shortDisplayText = (shortDisplayText || '') + ': ' + (this.name || '')
    }
    return shortDisplayText;
  }


}

export class GoverningEntity extends ModelExtender {
  public id: number;
  public opGoverningEntityVersion: any;
  public clusterNumber: string;
  public opEntityPrototypeId: number;
  public opEntityPrototype: any;
  public entityType: string;
  public name: string;
  public operationId: number;
  public value: any;
  public opAttachments: Array<Attachment>;

  constructor (governingEntity) {
    super();
    Object.assign(this, governingEntity);
  }
}

export class Attachment {
  public id: number;
  public opAttachmentVersion: any;
  public opAttachmentPrototypeId: number;
  public opAttachmentPrototype: any;
  public objectId : number;
  public objectType : string;

  constructor (attachment) {
    Object.assign(this, attachment);
  }
}
