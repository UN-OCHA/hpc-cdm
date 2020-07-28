import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import { BaseStyling, C, styled, dataLoader } from '@unocha/hpc-ui';

import env from '../environments/environment';
import { AppContext } from './context';
import { LANGUAGE_CHOICE, LanguageKey, t } from '../i18n';
import { Z_INDEX } from './layout';
import * as paths from './paths';

import MainNavigation from './components/main-navigation';

import PageNotLoggedIn from './pages/not-logged-in';
import PageNotFound from './pages/not-found';
import PageOperationsList from './pages/operations-list';
import PageOperation from './pages/operation';

const CLS = {
  HEADER: 'header',
};

interface Props {
  className?: string;
}

interface State {
  lang: LanguageKey;
}

export const App = (props: Props) => {
  const { className } = props;

  const [lang, setLang] = useState(LANGUAGE_CHOICE.getLanguage());

  useEffect(() => {
    LANGUAGE_CHOICE.addListener(setLang);
    return () => {
      LANGUAGE_CHOICE.removeListener(setLang);
    };
  }, []);

  const loadEnv = dataLoader([], () =>
    env().catch((err) => {
      console.error(err);
      throw new Error(t.t(lang, (s) => s.errors.unableToLoadCDM));
    })
  );
  return (
    <>
      <BaseStyling />
      <C.Loader
        loader={loadEnv}
        strings={{
          ...t.get(lang, (s) => s.components.loader),
          notFound: {
            ...t.get(lang, (s) => s.components.notFound),
            ...t.get(lang, (s) => s.routes.operations.notFound),
          },
        }}
      >
        {(env) => (
          <AppContext.Provider value={{ lang, env: () => env }}>
            <div className={className}>
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
                    <Switch>
                      <Route
                        path={paths.home()}
                        exact
                        render={() => <div>HOMEPAGE</div>}
                      />
                      <Route
                        path={paths.operations()}
                        exact
                        component={PageOperationsList}
                      />
                      <Route
                        path={paths.operationMatch()}
                        component={PageOperation}
                      />
                      <Route component={PageNotFound} />
                    </Switch>
                  </>
                ) : (
                  <PageNotLoggedIn />
                )}
              </main>
            </div>
          </AppContext.Provider>
        )}
      </C.Loader>
    </>
  );
};

export default styled(App)`
  > .${CLS.HEADER} {
    position: relative;
    z-index: ${Z_INDEX.HEADER};
  }
`;
