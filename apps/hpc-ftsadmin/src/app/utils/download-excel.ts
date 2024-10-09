// TODO: Check if this should be done on backend side, Currently not working properly
import { Workbook } from 'exceljs';
export const downloadExcel = <T>(
  data: T[],
  fileName: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
      worksheet.addRows(data);
      workbook.xlsx.writeFile(`${fileName}.xlsx`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
