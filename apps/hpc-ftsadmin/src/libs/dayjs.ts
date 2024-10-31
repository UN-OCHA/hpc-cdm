/**
 * Day.js is highly modular,
 * and requires explicitly declaring the modules required.
 */

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

// Import languages that we require

import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/zh';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const FTS_DEFAULT_FORMAT = 'DD/MM/YYYY';

// Extend the Dayjs class with the new format function
dayjs.extend((_, DayjsClass) => {
  const oldFormat = DayjsClass.prototype.format;

  DayjsClass.prototype.format = function (formatString?: string) {
    return oldFormat.bind(this)(formatString ?? FTS_DEFAULT_FORMAT);
  };
});

declare module 'dayjs' {
  interface Dayjs {
    /**
     * * This is a modified version of Dayjs format() function *
     * Get the formatted date according to the string of tokens passed in.
     *
     * To escape characters, wrap them in square brackets (e.g. [MM]).
     * ```
     * dayjs().format()// => Format to standard FTS Admin date Format 'DD/MM//YYYY'
     * dayjs('2019-01-25').format('[YYYYescape] YYYY-MM-DDTHH:mm:ssZ[Z]')// 'YYYYescape 2019-01-25T00:00:00-02:00Z'
     * dayjs('2019-01-25').format('DD/MM/YYYY') // '25/01/2019'
     * ```
     * Docs: https://day.js.org/docs/en/display/format
     */
    format(formatString?: string): string;
  }
}

export default dayjs;
