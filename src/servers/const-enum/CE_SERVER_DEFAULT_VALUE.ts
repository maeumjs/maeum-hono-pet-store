export const CE_SERVER_DEFAULT_VALUE = {
  TRACKING_ID_AC: 'tracking-id-in-async-context',
} as const;

export type CE_SERVER_DEFAULT_VALUE =
  (typeof CE_SERVER_DEFAULT_VALUE)[keyof typeof CE_SERVER_DEFAULT_VALUE];
