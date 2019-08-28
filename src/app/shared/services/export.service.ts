import { Injectable } from '@angular/core';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable()
export class ExportService {
  constructor() {
  }

  public createWorkbook () {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    return wb;
  }

  public createSheetOnWorkbook (wb, sheetName, data) {
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    const wscols = [];
    if (data && data.length) {
      data[0].forEach((cell, idx) => {
        let size = 0;
        if ( cell && cell.length ) {
          if (data[1][idx] && cell.length < data[1][idx].length) {
            size = data[1][idx].length;
          } else {
            size = cell.length;
          }
        }
        if (size < 10 ) {
          size = 10;
        }
        wscols.push({wch : size});
      });
      ws['!cols'] = wscols;
    }

    XLSX.utils.book_append_sheet(wb, ws, this.truncateSheetName(sheetName));

  }

  public sendWorkbookToFile (wb, fileName) {
    const wbout: string = XLSX.write(wb, { type: 'binary' });
    const blob = new Blob([this.s2ab(wbout)], {type: 'application/vnd.ms-excel'});
    saveAs(blob, fileName);
  }

  public exportData(data: Array<Array<Array<any>>>, fileName: string, sheetNames?: Array<string>) {
    /* generate workbook */
    const wb = this.createWorkbook();

    /* create worksheet on workbook*/
    data.forEach((sheet, idx) => {

      let name = `Sheet${idx}`;
      if (sheetNames && sheetNames[idx]) {
        name = sheetNames[idx];
      }
      this.createSheetOnWorkbook(wb, name, sheet);
    });

    /* save to file */
    this.sendWorkbookToFile(wb, fileName);
  }

  public turnArrayOfObjectsIntoArrayOfArrays (objects: Array<any>, order?: Array<string>, titles?: Array<string>): Array<Array<any>> {
    let firstRowKeys = [];

    if (!order) {
      Object.keys(objects[0]).forEach(key => {
        firstRowKeys.push(key);
      });
    } else {
      firstRowKeys = order;
    }

    const data = [];
    objects.forEach((object, idx) => {
      data[idx] = [];
      firstRowKeys.forEach(key => {
        data[idx].push(object[key]);
      })
    });

    if (!titles) {
      titles = firstRowKeys;
    }

    data.unshift(titles);
    return data;
  }

  private s2ab(s: string): ArrayBuffer {
    const buf: ArrayBuffer = new ArrayBuffer(s.length);
    const view: Uint8Array = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      // tslint:disable-next-line:no-bitwise
      view[i] = s.charCodeAt(i) & 0xFF
    };
    return buf;
  }

  private truncateSheetName(sheetName) {
    if (sheetName.length > 31) {
      return sheetName.substring(0, 27) + '...';
    }
    return sheetName;
  }
}
