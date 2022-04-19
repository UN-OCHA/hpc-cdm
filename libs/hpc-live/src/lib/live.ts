import {
  UserManager,
  User,
  OidcMetadata,
  WebStorageStateStore,
} from 'oidc-client';

import { config, Session } from '@unocha/hpc-core';

import { LiveModel } from './model';

/**
 * Construct the OIDC Metadata for HID,
 * this is neccesary because HID doesn't include information about the
 * logout endpoint in its metadata, and we need to add it manually.
 */
const getOpenIDMetadata = async (authUrl: string): Promise<OidcMetadata> => {
  const metadataEndpoint = new URL(
    '/.well-known/openid-configuration',
    authUrl
  );
  const logoutEndpoint = new URL('/logout', authUrl);
  logoutEndpoint.searchParams.set('redirect', location.origin);

  const req = await fetch(metadataEndpoint.href);
  if (!req.ok) {
    throw new Error('Unable to get HID metadata');
  }
  const metadata: OidcMetadata = await req.json();
  metadata.end_session_endpoint = logoutEndpoint.href;
  console.log(metadata);
  return metadata;
};

export class LiveBrowserClient {
  private readonly config: config.Config;
  private readonly store: WebStorageStateStore;
  private readonly userManager: Promise<UserManager>;

  public constructor(config: config.Config) {
    console.log('initializing live', config);

    this.config = config;

    const redirectUri = new URL(document.location.href);
    redirectUri.pathname = '/';
    redirectUri.hash = '';

    this.store = new WebStorageStateStore({
      store: localStorage,
    });

    (
      window as unknown as { clearSessionStorage: () => Promise<void> }
    ).clearSessionStorage = this.clearSessionStorage;

    this.userManager = getOpenIDMetadata(config.hpcAuthUrl).then(
      (metadata) =>
        new UserManager({
          client_id: config.hpcAuthClientId,
          authority: config.hpcAuthUrl,
          redirect_uri: redirectUri.href,
          response_type: 'token',
          scope: 'profile',
          userStore: this.store,
          metadata,
        })
    );
  }

  private clearSessionStorage = async () => {
    const keys = await this.store.getAllKeys();
    await Promise.all(keys.map((key) => this.store.remove(key)));
    window.location.reload();
  };

  private getSessionUser = async (
    user: User | null
  ): Promise<Session['getUser']> => {
    if (!user) {
      return () => null;
    } else {
      const accountUrl = new URL('/account.json', this.config.hpcAuthUrl);
      const res = await fetch(accountUrl.href, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      if (!res.ok) {
        return () => ({
          name: 'unknown',
        });
      } else {
        const info = await res.json();
        return () => ({
          name: info.name || 'unknown',
        });
      }
    }
  };

  public init = async () => {
    const userManager = await this.userManager;
    // Attempt to load
    await userManager
      .signinRedirectCallback()
      .then((user) => {
        const redirectTo = user.state || document.location.pathname;
        if (history.replaceState) {
          history.replaceState(null, document.title, redirectTo);
          // TODO: interact directly with React Router history to get it to reload
          // the route without needing to reload the page
          window.location.reload();
        } else {
          window.location = redirectTo;
        }
      })
      .catch(() => {
        // No sign in response, that's fine
      });
    const user = await userManager.getUser();
    const session: Session = {
      getUser: await this.getSessionUser(user),
      logIn: () =>
        userManager.signinRedirect({
          state: window.location.href,
        }),
      logOut: () =>
        userManager.signoutRedirect().then(() => userManager.removeUser()),
    };

    // When user logs in/out in a different tab, log in/out in current tab as well
    window.addEventListener('storage', (e) => {
      // This is how oidc-client creates its storage keys
      const keyPart = `user:${this.config.hpcAuthUrl}:${this.config.hpcAuthClientId}`;
      if (e.key?.indexOf(keyPart) !== -1) {
        // Reload the window to have new session from different tab applied to current one
        window.location.reload();
      }
    });

    if (user) {
      const result = {
        session,
        model: new LiveModel({
          baseUrl: this.config.hpcApiUrl,
          hidToken: user.access_token,
          clearSessionStorage: this.clearSessionStorage,
        }),
      };
      return result;
    } else {
      const result = {
        session,
        model: new LiveModel({
          baseUrl: this.config.hpcApiUrl,
          hidToken: null,
          clearSessionStorage: this.clearSessionStorage,
        }),
      };
      return result;
    }
  };
}
