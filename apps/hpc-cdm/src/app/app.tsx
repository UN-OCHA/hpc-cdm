import React from 'react';
import { Route, Link } from 'react-router-dom';

import { BaseStyling, C, styled } from '@unocha/hpc-ui';

import env from '../environments/environment';
import PageNotLoggedIn from './pages/not-logged-in';
import { AppContext } from './context';
import { LANGUAGE_CHOICE, LanguageKey } from '../i18n';
import { Z_INDEX } from './layout';

import MainNavigation from './components/main-navigation';

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
          />
          <main>
            {env.session.getUser() ? (
              <>
                <MainNavigation />
                <Route
                  path="/"
                  exact
                  render={() => (
                    <div>
                      This is the generated root route.{' '}
                      <Link to="/page-2">Click here for page 2.</Link>
                    </div>
                  )}
                />
                <Route
                  path="/page-2"
                  exact
                  render={() => (
                    <div>
                      <Link to="/">Click here to go back to root page.</Link>
                    </div>
                  )}
                />
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
