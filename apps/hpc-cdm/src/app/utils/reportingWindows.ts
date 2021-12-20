import { MdPending, MdLock, MdPendingActions } from 'react-icons/md';

import { t, LanguageKey } from '../../i18n';

import { reportingWindows } from '@unocha/hpc-data';
import { THEME, Types } from '@unocha/hpc-ui';
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

const colorOpen = THEME.colors.pallete.blue.normal;
const colorClosed = THEME.colors.pallete.orange.normal;
const colorPending = THEME.colors.pallete.gray.light;

export const prepareReportingWindowsAsSidebarNavigation = (
  lang: LanguageKey,
  reportingWindows: reportingWindows.ReportingWindow[],
  generatePath: (window: reportingWindows.ReportingWindow) => string
): Types.SidebarNavigationItem[] =>
  reportingWindows.map((w) => ({
    label: w.name,
    path: generatePath(w),
    icon: {
      icon:
        w.state === 'open'
          ? MdPendingActions
          : w.state === 'pending'
          ? MdPending
          : MdLock,
      color:
        w.state === 'open'
          ? colorOpen
          : w.state === 'pending'
          ? colorPending
          : colorClosed,
      title: t.get(lang, (s) => s.common.reportingWindows.state[w.state]),
    },
  }));
