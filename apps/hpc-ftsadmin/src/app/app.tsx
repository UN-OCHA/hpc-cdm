import { BaseStyling, C, dataLoader, dialogs, styled } from '@unocha/hpc-ui';
import { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import env, { Environment } from '../environments/environment';
import { LanguageKey, LANGUAGE_CHOICE, t } from '../i18n';
import PageMeta from './components/page-meta';
import { AppContext, contextFromEnv } from './context';
import { Z_INDEX } from './layout';
import PageNotFound from './pages/not-found';
import PageNotLoggedIn from './pages/not-logged-in';
import PageFlowsList from './pages/flows-list';
import * as paths from './paths';

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
  height: 100%;
  display: flex;
  align-items: center;
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
        throw new Error(t.t(lang, (s) => s.errors.unableToLoadFTSAdmin));
      })
      .then(contextFromEnv)
  );

  const appTitle = (
    <TitlePrimary>
      {t.t(lang, (s) => s.components.appTitle.primary)}
    </TitlePrimary>
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
                            label: t.t(lang, (s) => s.navigation.flows),
                            path: paths.flows(),
                          },
                        ]}
                      />
                      <Switch>
                        <Route path={paths.home()} exact>
                          <Redirect to={paths.flows()} />
                        </Route>
                        <Route
                          path={paths.flows()}
                          exact
                          component={PageFlowsList}
                        />
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
