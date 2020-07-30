import { UserManager, User } from 'oidc-client';

import { config, Session } from '@unocha/hpc-core';
import { Model } from '@unocha/hpc-data';

import { LiveModel } from './model';

export class LiveBrowserClient {
  private readonly config: config.Config;
  private readonly user: UserManager;

  public constructor(config: config.Config) {
    console.log('initializing live', config);

    this.config = config;

    const redirectUri = new URL(document.location.href);
    redirectUri.pathname = '/';
    redirectUri.hash = '';

    /* eslint-disable @typescript-eslint/camelcase */
    this.user = new UserManager({
      client_id: config.HPC_AUTH_CLIENT_ID,
      authority: config.HPC_AUTH_URL,
      redirect_uri: redirectUri.href,
      response_type: 'token',
      scope: 'profile',
    });
    /* eslint-enable @typescript-eslint/camelcase */
  }

  private getSessionUser = async (
    user: User | null
  ): Promise<Session['getUser']> => {
    if (!user) {
      return () => null;
    } else {
      const accountUrl = new URL(this.config.HPC_AUTH_URL);
      accountUrl.pathname = '/account.json';
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
    // Attempt to load
    await this.user
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
    const user = await this.user.getUser();
    const session: Session = {
      getUser: await this.getSessionUser(user),
      logIn: () =>
        this.user.signinRedirect({
          state: window.location.href,
        }),
      logOut: () => this.user.signoutRedirect(),
    };
    if (user) {
      const result = {
        session,
        model: new LiveModel({
          baseUrl: this.config.HPC_API_URL,
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
