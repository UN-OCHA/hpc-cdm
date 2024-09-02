// TODO: Check if this should be done on backend side, Currently not working properly
import * as XLSX from 'xlsx';
export const downloadExcel = <T>(
  data: T[],
  fileName: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet<T>(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
