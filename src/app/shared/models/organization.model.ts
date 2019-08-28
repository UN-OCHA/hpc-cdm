export class OrganizationModel {

  public id: number;
  public name: string;
  public abbreviation: string;
  public custom: boolean;

  constructor(organizationRecord?: any) {
    if (!organizationRecord) {
      organizationRecord = {};
    }

    this.id = organizationRecord.id;
    this.name = organizationRecord.name || '';
    this.abbreviation = organizationRecord.abbreviation || '';
    this.custom = organizationRecord.custom || false;
  }
}
