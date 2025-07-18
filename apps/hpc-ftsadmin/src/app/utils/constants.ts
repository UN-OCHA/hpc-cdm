export const PENDING_REVIEW = 'Pending review' as const;
export const CTP = 'Cash transfer programming (CTP)' as const;
export const TRADITIONAL_AID = 'Traditional aid' as const;

export const TOAST_CONFIG = {
  position: 'top-center',
  theme: 'colored',
} as const;
export const TOAST_CONFIG_ERROR = {
  ...TOAST_CONFIG,
  autoClose: false,
} as const;

export const SPECIAL_SEPARATOR = '<||>' as const;
export const EMPTY_CELL = '--' as const;

export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * We want to format currencies with the same format, so we chose `en-GB`
 * as standard locale to use on formatting.
 */
export const DEFAULT_LOCALE_INTL = new Intl.Locale('en-GB');
