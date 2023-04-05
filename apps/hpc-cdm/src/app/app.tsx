import React, { useState, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { BaseStyling, C, styled, dataLoader, dialogs } from '@unocha/hpc-ui';

import env, { Environment } from '../environments/environment';
import { AppContext, contextFromEnv } from './context';
import { LANGUAGE_CHOICE, LanguageKey, t } from '../i18n';
import { Z_INDEX } from './layout';
import * as paths from './paths';
import PageMeta from './components/page-meta';

import PageAdmin from './pages/admin';
import PageNotLoggedIn from './pages/not-logged-in';
import PageNotFound from './pages/not-found';
import PageOperationsList from './pages/operations-list';
import PageOperation from './pages/operation';

const environmentWarning = (env: Environment, lang: LanguageKey) => {
  const warning = env.getDevHeaderWarning(lang);
  if (warning) {
    return <C.DevEnvWarning message={warning} />;
  }
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled(C.Header)`
  position: relative;
  z-index: ${Z_INDEX.HEADER};
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const LoggedInContainer = styled.div`
  width: 100%;
  margin-bottom: ${(p) => p.theme.marginPx.lg * 2}px;
`;

const TitlePrimary = styled.div`
  line-height: 100%;
  font-size: 1.9rem;
  font-weight: bold;
`;

const TitleSecondary = styled.div`
  line-height: 100%;
  font-size: 1.7rem;
`;

toast.configure();

export const App = () => {
  const [lang, setLang] = useState(LANGUAGE_CHOICE.getLanguage());

  useEffect(() => {
    LANGUAGE_CHOICE.addListener(setLang);
    return () => {
      LANGUAGE_CHOICE.removeListener(setLang);
    };
  }, []);

  const loadEnv = dataLoader([], () =>
    env()
      .catch((err) => {
        console.error(err);
        throw new Error(t.t(lang, (s) => s.errors.unableToLoadCDM));
      })
      .then(contextFromEnv)
  );

  const appTitle = (
    <>
      <TitlePrimary>
        {t.t(lang, (s) => s.components.appTitle.primary)} (v
        {APP_VERSION})
      </TitlePrimary>
      <TitleSecondary>
        {t.t(lang, (s) => s.components.appTitle.secondary)}
      </TitleSecondary>
    </>
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
        {(context) => {
          const env = context.env();
          const { canModifyGlobalUserAccess } = context.access().permissions;
          return (
            <AppContext.Provider value={{ lang, ...context }}>
              <PageMeta />
              <Container>
                {environmentWarning(env, lang)}
                <Header
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
                <Main>
                  {env.session.getUser() ? (
                    <LoggedInContainer>
                      <C.MainNavigation
                        homeLink={paths.home()}
                        appTitle={appTitle}
                        tabs={[
                          {
                            label: t.t(lang, (s) => s.navigation.operations),
                            path: paths.operations(),
                          },
                          ...(canModifyGlobalUserAccess
                            ? [
                                {
                                  label: t.t(lang, (s) => s.navigation.admin),
                                  path: paths.admin(),
                                },
                              ]
                            : []),
                        ]}
                      />
                      <Switch>
                        <Route path={paths.home()} exact>
                          <Redirect to={paths.operations()} />
                        </Route>
                        <Route
                          path={paths.operations()}
                          exact
                          component={PageOperationsList}
                        />
                        <Route
                          path={paths.operationMatch()}
                          component={PageOperation}
                        />
                        {canModifyGlobalUserAccess && (
                          <Route path={paths.admin()} component={PageAdmin} />
                        )}
                        <Route component={PageNotFound} />
                      </Switch>
                    </LoggedInContainer>
                  ) : (
                    <>
                      <C.MainNavigation
                        homeLink={paths.home()}
                        appTitle={appTitle}
                      />
                      <PageNotLoggedIn />
                    </>
                  )}
                </Main>
              </Container>
              <dialogs.Dialogs />
            </AppContext.Provider>
          );
        }}
      </C.Loader>
    </>
  );
};

export default App;
