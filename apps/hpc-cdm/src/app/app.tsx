import React from 'react';
import { Route, Link } from 'react-router-dom';

import { BaseStyling, Header } from '@unocha/hpc-ui';

import env from '../environments/environment';
import PageNotLoggedIn from './pages/not-logged-in';
import { AppContext } from './context';
import { LANGUAGE_CHOICE, LanguageKey } from '../i18n';

interface State {
  lang: LanguageKey;
}

export class App extends React.Component<{}, State> {
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
        <Header session={env.session} language={LANGUAGE_CHOICE} />
        <main>
          {env.session.getUser() ? (
            <>
              <div role="navigation">
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/page-2">Page 2</Link>
                  </li>
                </ul>
              </div>
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
      </AppContext.Provider>
    );
  };
}

export default App;
