// This file is imported by middleware (Edge Runtime) which doesn't support crypto
// We only export types here
export type LicenseClaims = {
  key: string;
  role: string;
  mode: string;
  tenant: string;
  readOnly: boolean;
  exp: number; // unix seconds
};

export const LICENSE_COOKIE = "bick_license";
