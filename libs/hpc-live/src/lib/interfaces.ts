import type { config, Session } from '@unocha/hpc-core';
import type { LiveModel } from './model';

export interface AuthResult {
  session: Session;
  model: LiveModel;
}

export interface AuthProvider {
  init(): Promise<AuthResult>;
  clearSessionStorage(): void;
}

export enum AuthProviderType {
  HID = 'hid',
  ENTRA_ID = 'entra-id',
}

export interface HIDConfig {
  hpcAuthUrl: string;
  hpcAuthClientId: string;
  hpcApiUrl: string;
}

export interface EntraIDConfig extends config.Config {
  entraClientId: string;
  entraTenantId: string;
}
