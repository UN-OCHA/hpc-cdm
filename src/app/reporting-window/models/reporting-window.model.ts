import * as moment from 'moment';

import { ModelExtender } from 'app/operation/models/model-extender.model';

export class ReportingWindow extends ModelExtender {

  public exists = false;
  public id: number;
  public value: any;
  public creatorParticipantId: number;
  public operationId: number;
  public planId: number;
  public status: string;
  public context: any;
  public startDate: Date;
  public endDate: Date;
  public createdAt: Date;
  public updatedAt: Date;

  public editableByUser = false;

  constructor (options:any) {
    super();

    Object.assign(this, options);

//    this.startDate = moment(options.startDate).toDate() || null;
//    this.endDate = moment(options.endDate).toDate() || null;
    this.createdAt = moment(options.createdAt).toDate();
    this.updatedAt = moment(options.updatedAt).toDate();

  }

}

export class Element extends ModelExtender {
  public id: number;

  constructor (element:any) {
    super();
    Object.assign(this, element);
  }
}
