import { C, CLASSES, styled } from '@unocha/hpc-ui';
import { t } from '../../i18n';
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

const AUN = styled(C.AcceptableUseNotification)`
  flex-grow: 1;
`;

const PageNotLoggedIn = (props: Props) => (
  <AppContext.Consumer>
    {({ lang, env }) => (
      <Container className={CLASSES.CONTAINER.CENTERED}>
        <AUN
          session={env().session}
          strings={t.get(lang, (s) => s.components.acceptableUseNotification)}
        />
      </Container>
    )}
  </AppContext.Consumer>
);

export default PageNotLoggedIn;
