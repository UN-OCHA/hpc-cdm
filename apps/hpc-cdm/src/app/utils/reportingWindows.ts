import { reportingWindows } from '@unocha/hpc-data';
/**
 * Get the reporting window that is most likely to be useful to the current
 * user.
 */
export const getBestReportingWindow = (
  ws: reportingWindows.ReportingWindow[]
): reportingWindows.ReportingWindow => {
  if (ws.length === 0) {
    throw new Error(`getBestReportingWindow called with 0 reporting windows`);
  }
  return (
    ws.filter((w) => w.state === 'open')[0] ||
    ws.filter((w) => w.state === 'pending')[0] ||
    ws[0]
  );
};
