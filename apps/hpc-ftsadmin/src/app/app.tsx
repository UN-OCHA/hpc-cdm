import {
  BaseStyling,
  C,
  CLASSES,
  dialogs,
  styled,
  ThemeProvider,
  useDataLoader,
} from '@unocha/hpc-ui';
import { useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { Outlet } from 'react-router';
import { Slide, ToastContainer } from 'react-toastify';
import env, { type Environment } from '../environments/environment.prod';
import { type LanguageKey, LANGUAGE_CHOICE, t } from '../i18n';
import PageMeta from './components/page-meta';
import { AppContext, contextFromEnv } from './context';
import { Z_INDEX } from './layout';
import PageNotLoggedIn from './pages/not-logged-in';
import paths from './paths';

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
`;

const TitlePrimary = styled.div`
  line-height: 100%;
  font-size: 1.9rem;
  font-weight: bold;
  height: 100%;
  display: flex;
  align-items: center;
`;

/**
 *  https://fkhadra.github.io/react-toastify/how-to-style#override-css-variables
 */
const ToastContainerStyled = styled(ToastContainer)`
  .Toastify__toast-theme--colored.Toastify__toast--success {
    background-color: ${(p) => p.theme.colors.pallete.green.normal};
  }
  .Toastify__toast-theme--colored.Toastify__toast--error {
    background-color: ${(p) => p.theme.colors.pallete.red.dark};
  }
`;

export const App = () => {
  const [lang, setLang] = useState(LANGUAGE_CHOICE.getLanguage());

  useEffect(() => {
    LANGUAGE_CHOICE.addListener(setLang);
    return () => {
      LANGUAGE_CHOICE.removeListener(setLang);
    };
  }, []);

  const [loadEnv] = useDataLoader([], () =>
    env()
      .catch((error) => {
        console.error(error);
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
    <ThemeProvider language={lang}>
      <BaseStyling />
      <C.Loader
        loader={loadEnv}
        strings={{
          ...t.get(lang, (s) => s.components.loader),
          notFound: t.get(lang, (s) => s.components.notFound),
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
                          {
                            label: t.t(lang, (s) => s.navigation.pendingFlows),
                            path: paths.pendingFlows(),
                          },
                          {
                            label: t.t(lang, (s) => s.navigation.organizations),
                            path: paths.organizations(),
                          },
                          {
                            label: t.t(lang, (s) => s.navigation.keywords),
                            path: paths.keywords(),
                          },
                          {
                            label: t.t(lang, (s) => s.navigation.uploadXLSX),
                            path: paths.uploadXLSX(),
                          },
                          {
                            label: t.t(lang, (s) => s.navigation.addFlow),
                            path: paths.addFlow(),
                            icon: MdAdd,
                            selected: false,
                          },
                        ]}
                        className={CLASSES.CONTAINER.FLUID}
                        externalLinks={[
                          ...(env.externalUrls?.rpmBaseUrl
                            ? [
                                {
                                  label: t.t(lang, (s) => s.navigation.rpm),
                                  url: env.externalUrls.rpmBaseUrl,
                                },
                              ]
                            : []),
                          ...(env.externalUrls?.prismBaseUrl
                            ? [
                                {
                                  label: t.t(lang, (s) => s.navigation.prism),
                                  url: env.externalUrls.prismBaseUrl,
                                },
                              ]
                            : []),
                          ...(env.externalUrls?.ftsWebsiteBaseUrl
                            ? [
                                {
                                  label: t.t(
                                    lang,
                                    (s) => s.navigation.ftsWebsite
                                  ),
                                  url: env.externalUrls.ftsWebsiteBaseUrl,
                                },
                              ]
                            : []),
                          ...(env.externalUrls?.helpUrl
                            ? [
                                {
                                  label: t.t(lang, (s) => s.navigation.help),
                                  url: env.externalUrls.helpUrl,
                                },
                              ]
                            : []),
                        ]}
                      />
                      <Outlet />
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
      <ToastContainerStyled limit={5} stacked transition={Slide} />
    </ThemeProvider>
  );
};

export default App;
