import { UserManager, User } from 'oidc-client';

import { config, Session } from '@unocha/hpc-core';
import { Model } from '@unocha/hpc-data';

export class LiveBrowser {
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
      scope: 'profile',
    });
    /* eslint-enable @typescript-eslint/camelcase */
  }

  private getSessionUser(user: User | null): Session['getUser'] {
    if (!user) {
      return () => null;
    } else {
      return () => ({
        name: user.profile.name || 'unknown',
      });
    }
  }

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
    console.log(user);
    const session: Session = {
      getUser: this.getSessionUser(user),
      logIn: () =>
        this.user.signinRedirect({
          state: window.location.href,
        }),
      logOut: () => this.user.signoutRedirect(),
    };
    const result = {
      session,
      get model(): Model {
        throw new Error('Production environment not implemented');
      },
    };
    return result;
  };
}
