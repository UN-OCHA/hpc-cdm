import { FilterRecord } from './filterRecord.interface';

export interface RecordControlService {

  // Optional
  tableSummary?: any;
  currentTableView?: string;
  filterRecord?: FilterRecord;
  approvalStatus$?: any;
  formatTable$?: any;
  addRecord$?: any;
  resizeContainer$?: any;
  deleteRecord$?: any;
  deletedRecords?: Array<any>;
  deleteUrl?: string;
  addUrl?: string;

  // Required
  recordType: string;
  recordStructure: Array<any>;
  loadUrl: string;
  saveUrl: string;
  tableTotals: any;
  loadTable$: any;
  saveTable$: any;

  setDefaultSort(record: any);
  getRecordStructure(): Array<any>;
  setFilterRecord(record: FilterRecord): void;
  getFilterRecord(): FilterRecord;
  saveRecords(records: Array<any>): void;
  loadData(): void;
  getTableData();
  getTableTotalsArray(): any;
  updateTableTotals(): void;
  countRecordsWithErrors(records: Array<any>): number;
  countRecordsWithWarnings(records: Array<any>): number;

  setRecordErrorWarningFlag?(record: any): void;
  clearFilterRecord?(): void;
  loadFilterRecord?(record: FilterRecord): void;
  approveAllRecords?(): void;
  disapprove?(): void;
  addRecord?(): void;

}
