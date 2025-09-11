import { type config } from '@unocha/hpc-core';
import { EntraIDProvider } from './entraid-live';
import { HIDProvider } from './hid-live';
import {
  AuthProviderType,
  type AuthProvider,
  type AuthResult,
  type EntraIDConfig,
} from './interfaces';

export class LiveBrowserClient {
  private readonly authProvider: AuthProvider;

  public constructor(config: config.Config) {
    const providerType = this.determineProviderType(config);

    switch (providerType) {
      case AuthProviderType.ENTRA_ID:
        // Even though we determined to use Entra ID,
        // TS cannot infer that `entraClientId` and `entraTenantId` are defined
        if (!this.hasEntraIDConfig(config)) {
          throw new Error('Missing Entra ID configuration');
        }

        this.authProvider = new EntraIDProvider(config);
        break;
      case AuthProviderType.HID:
        this.authProvider = new HIDProvider(config);
        break;
      default:
        throw new Error(`Unsupported auth provider type: ${providerType}`);
    }
  }

  /**
   * Initialize authentication and return session + model
   */
  public init = (): Promise<AuthResult> => {
    return this.authProvider.init();
  };

  /**
   * Clear session storage
   */
  public clearSessionStorage = (): void => {
    this.authProvider.clearSessionStorage();
  };

  /**
   * Checks if we're running in local environment
   */
  private isLocal(): boolean {
    return (
      ['localhost', '127.0.0.1'].includes(globalThis.location.hostname) &&
      globalThis.location.port === '4200' // Default port for Nx Webpack dev server
    );
  }

  /**
   * Checks if Entra ID configuration is present and valid
   */
  private hasEntraIDConfig(config: config.Config): config is EntraIDConfig {
    return !!(config.entraClientId && config.entraTenantId);
  }

  /**
   * Determines which auth provider to use based on configuration and environment
   */
  private determineProviderType(config: config.Config): AuthProviderType {
    // In non-local environments, prefer Entra ID, if configured
    if (!this.isLocal() && this.hasEntraIDConfig(config)) {
      return AuthProviderType.ENTRA_ID;
    }

    return AuthProviderType.HID;
  }
}
