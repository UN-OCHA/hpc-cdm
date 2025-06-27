export const PENDING_REVIEW = 'Pending review';

export const TOAST_CONFIG = {
  position: 'top-center',
  theme: 'colored',
} as const;

export const TOAST_CONFIG_ERROR = {
  ...TOAST_CONFIG,
  autoClose: false,
} as const;

export const URL_REGEX = /^https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;
