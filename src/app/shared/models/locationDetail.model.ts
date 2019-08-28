export class LocationDetail {

  public id: number;
  public name: string;
  public adminLevel: number;
  public parentId: number;

  constructor(locationDetailRecord?: any) {
    if (!locationDetailRecord) {
      locationDetailRecord = {};
    }
    this.id = locationDetailRecord.id || 0;
    this.name = locationDetailRecord.name || '';
    this.adminLevel = locationDetailRecord.adminLevel || 0;
    this.parentId = locationDetailRecord.parentId || 0;
  }
}
