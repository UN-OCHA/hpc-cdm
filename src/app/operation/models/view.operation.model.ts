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
  public opGoverningEntities: Array<any>
  public opAttachments: Array<any>;
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
  public entityPrototypeId: number;
  public entityType: string;
  public name: string;
  public planId: number;
  public value: any;
  public globalClusters: Array<any>;
  public overriding: boolean;

  constructor (governingEntity) {
    super();
    Object.assign(this, governingEntity);
  }
}
