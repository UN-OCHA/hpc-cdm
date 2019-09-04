import * as moment from 'moment';

import { ModelExtender } from 'app/operation/models/model-extender.model';

export class Operation extends ModelExtender {
  public exists = false;
  public id: number;
  public code: string;
  public version: number;

  public startDate: Date;
  public endDate: Date;

  public planVersion: any;
  public emergencies: Array<any>;
  public locations: Array<any>;
  public entityPrototypes: Array<any>;
  public attachmentPrototypes: Array<any>;
  public governingEntities: Array<any>
  public attachments: Array<any>;
  public name: string;
  public latestVersionId: number;
  public currentPublishedVersionId: number;

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
    this.endDate = options.planVersion.endDate ? moment(options.planVersion.endDate).toDate() : null;
    this.startDate = moment(options.startDate).toDate();
    this.governingEntities = options.governingEntities;

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
  public governingEntityVersion: any;
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
