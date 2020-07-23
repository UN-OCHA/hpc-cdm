import React from 'react';
import { Route } from 'react-router-dom';

import { BaseStyling, C, styled } from '@unocha/hpc-ui';

import env from '../environments/environment';
import { AppContext } from './context';
import { LANGUAGE_CHOICE, LanguageKey, t } from '../i18n';
import { Z_INDEX } from './layout';
import * as paths from './paths';

import MainNavigation from './components/main-navigation';

import PageNotLoggedIn from './pages/not-logged-in';

import OperationsRoutes from './routes/operations';

const CLS = {
  HEADER: 'header',
};

interface Props {
  className?: string;
}

interface State {
  lang: LanguageKey;
}

export class App extends React.Component<Props, State> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      lang: LANGUAGE_CHOICE.getLanguage(),
    };
  }

  private languageChanged = (lang: LanguageKey) => {
    this.setState({ lang });
  };

  public componentDidMount() {
    LANGUAGE_CHOICE.addListener(this.languageChanged);
  }

  public componentWillUnmount() {
    LANGUAGE_CHOICE.removeListener(this.languageChanged);
  }

  public render = () => {
    const { lang } = this.state;
    return (
      <AppContext.Provider value={{ lang }}>
        <BaseStyling />
        <div className={this.props.className}>
          <C.Header
            className={CLS.HEADER}
            session={env.session}
            language={LANGUAGE_CHOICE}
            strings={t.get(lang, (s) => s.user)}
            userMenu={[
              {
                label: t.t(lang, (s) => s.user.logout),
                onClick: env.session.logOut,
              },
            ]}
          />
          <main>
            {env.session.getUser() ? (
              <>
                <MainNavigation />
                <Route
                  path={paths.HOME}
                  exact
                  render={() => <div>HOMEPAGE</div>}
                />
                <OperationsRoutes />
              </>
            ) : (
              <PageNotLoggedIn />
            )}
          </main>
        </div>
      </AppContext.Provider>
    );
  };
}

export default styled(App)`
  > .${CLS.HEADER} {
    position: relative;
    z-index: ${Z_INDEX.HEADER};
  }
`;
