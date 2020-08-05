import { UserManager, User, OidcMetadata } from 'oidc-client';

import { config, Session } from '@unocha/hpc-core';
import { Model } from '@unocha/hpc-data';

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
  // eslint-disable-next-line @typescript-eslint/camelcase
  metadata.end_session_endpoint = logoutEndpoint.href;
  console.log(metadata);
  return metadata;
};

export class LiveBrowserClient {
  private readonly config: config.Config;
  private readonly userManager: Promise<UserManager>;

  public constructor(config: config.Config) {
    console.log('initializing live', config);

    this.config = config;

    const redirectUri = new URL(document.location.href);
    redirectUri.pathname = '/';
    redirectUri.hash = '';

    this.userManager = getOpenIDMetadata(config.hpcAuthUrl).then(
      (metadata) =>
        new UserManager({
          // eslint-disable-next-line @typescript-eslint/camelcase
          client_id: config.hpcAuthClientId,
          authority: config.hpcAuthUrl,
          // eslint-disable-next-line @typescript-eslint/camelcase
          redirect_uri: redirectUri.href,
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_type: 'token',
          scope: 'profile',
          metadata,
        })
    );
  }

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
      logOut: () => userManager.signoutRedirect(),
    };
    if (user) {
      const result = {
        session,
        model: new LiveModel({
          baseUrl: this.config.hpcApiUrl,
          hidToken: user.access_token,
        }),
      };
      return result;
    } else {
      const result = {
        session,
        get model(): Model {
          throw new Error('Not logged in!');
        },
      };
      return result;
    }
  };
}
