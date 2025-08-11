/**
 * Day.js is highly modular,
 * and requires explicitly declaring the modules required.
 */

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
// Import languages that we require

import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/zh';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);

export default dayjs;
