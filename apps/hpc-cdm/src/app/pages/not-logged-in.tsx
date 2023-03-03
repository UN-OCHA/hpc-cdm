import React from 'react';
import { MdTranslate } from 'react-icons/md';

import { C, CLASSES, styled } from '@unocha/hpc-ui';

import { t, LANGUAGE_CHOICE } from '../../i18n';
import en from '../../i18n/langs/en';
import es from '../../i18n/langs/es';
import fr from '../../i18n/langs/fr';

import { AppContext } from '../context';

interface Props {
  className?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-top: 40px;
  padding-bottom: 40px;
`;

const Actions = styled.div`
  text-align: center;
`;

const IntroPara = styled.p`
  font-size: 1.6rem;
`;

const AUN = styled(C.AcceptableUseNotification)`
  flex-grow: 1;
`;

const PageNotLoggedIn = (props: Props) => (
  <AppContext.Consumer>
    {({ lang, env }) => (
      <Container className={CLASSES.CONTAINER.CENTERED}>
        <Actions>
          {lang !== 'en' && (
            <C.Button
              startIcon={MdTranslate}
              onClick={() => LANGUAGE_CHOICE.setLanguage('en')}
              color="secondary"
              text={en.strings.switchToThisLanguage}
            />
          )}
          {lang !== 'es' && (
            <C.Button
              startIcon={MdTranslate}
              onClick={() => LANGUAGE_CHOICE.setLanguage('es')}
              color="secondary"
              text={es.strings.switchToThisLanguage}
            />
          )}
          {lang !== 'fr' && (
            <C.Button
              startIcon={MdTranslate}
              onClick={() => LANGUAGE_CHOICE.setLanguage('fr')}
              color="secondary"
              text={fr.strings.switchToThisLanguage}
            />
          )}
        </Actions>
        <IntroPara>{t.get(lang, (s) => s.components.surveyIntro)}</IntroPara>
        <AUN
          session={env().session}
          strings={t.get(lang, (s) => s.components.acceptableUseNotification)}
        />
      </Container>
    )}
  </AppContext.Consumer>
);

export default PageNotLoggedIn;
