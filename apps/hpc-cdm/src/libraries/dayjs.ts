/**
 * Day.js is highly modular,
 * and requires explicitly declaring the modules required.
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Import languages that we require

import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import 'dayjs/locale/ar';

dayjs.extend(relativeTime);

export default dayjs;
