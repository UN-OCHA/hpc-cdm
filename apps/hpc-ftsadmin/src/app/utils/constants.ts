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
