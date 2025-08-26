import {
  PublicClientApplication,
  type AuthenticationResult,
} from '@azure/msal-browser';
import { type config, type Session } from '@unocha/hpc-core';
import { LiveModel } from './model';

export class LiveBrowserClient {
  private readonly config: config.Config;
  private readonly msalInstance: PublicClientApplication;

  public constructor(config: config.Config) {
    if (!config.entraClientId || !config.entraTenantId) {
      throw new Error('Missing Entra ID configuration');
    }

    console.log('initializing live with Entra ID', config);

    this.config = config;

    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: config.entraClientId,
        authority: `https://login.microsoftonline.com/${config.entraTenantId}`,
        redirectUri: globalThis.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    });

    (
      globalThis as unknown as { clearSessionStorage: () => void }
    ).clearSessionStorage = this.clearSessionStorage;
  }

  private clearSessionStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    globalThis.location.reload();
  };

  private getSessionUser = (
    account: AuthenticationResult | null
  ): Session['getUser'] => {
    if (!account) {
      return () => null;
    }
    return () => ({
      name: account.account?.name ?? 'unknown',
    });
  };

  public init = async () => {
    let account: AuthenticationResult | null = null;

    try {
      await this.msalInstance.initialize();

      const response = await this.msalInstance.handleRedirectPromise();
      if (response) {
        account = response;
        const redirectTo = response.state ?? document.location.pathname;
        if (history.replaceState) {
          history.replaceState(null, document.title, redirectTo);
          globalThis.location.reload();
        } else {
          globalThis.location.href = redirectTo;
        }
      }
    } catch {
      // No sign in response, that's fine
    }

    if (!account) {
      const currentAccounts = this.msalInstance.getAllAccounts();
      if (currentAccounts.length > 0) {
        try {
          account = await this.msalInstance.acquireTokenSilent({
            account: currentAccounts[0],
            scopes: ['User.Read'],
          });
        } catch {
          account = null;
        }
      }
    }

    const session: Session = {
      getUser: this.getSessionUser(account),
      logIn: () =>
        this.msalInstance.loginRedirect({
          scopes: ['User.Read'],
          state: globalThis.location.href,
        }),
      logOut: () => this.msalInstance.logoutRedirect(),
    };

    // Sync login/logout across tabs
    globalThis.addEventListener('storage', (e) => {
      if (e.key === `msal.1.token.keys.${this.config.entraClientId}`) {
        globalThis.location.reload();
      }
    });

    if (account) {
      const result = {
        session,
        model: new LiveModel({
          baseUrl: this.config.hpcApiUrl,
          hidToken: account.accessToken,
          clearSessionStorage: this.clearSessionStorage,
        }),
      };
      return result;
    }
    const result = {
      session,
      model: new LiveModel({
        baseUrl: this.config.hpcApiUrl,
        hidToken: null,
        clearSessionStorage: this.clearSessionStorage,
      }),
    };
    return result;
  };
}
