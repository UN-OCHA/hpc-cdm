import React from 'react';

import { styled } from '@unocha/hpc-ui';
import logo from '../../../assets/logos/enketologo.png';
import { ReactComponent as KLogo } from '../../../assets/logos/kobologo.svg';
import { AppContext } from '../../context';
import { t } from '../../../i18n';

const Box = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Text = styled.span`
  font-size: 16px; //min required by enketo
  padding: 0 2px;
  align-self: center;
`;

const EnketoLogo = styled.img`
  height: 18px;
  margin-top: 5px;
  padding: 0 2px;
`;

const KoboLogo = styled(KLogo)`
  width: 120px;
  height: 30px;
`;

const PoweredByFooter = () => (
  <AppContext.Consumer>
    {({ lang }) => (
      <Box>
        <Text>
          {t.get(lang, (s) => s.routes.operations.forms.footer.poweredBy)}
        </Text>
        <a href="https://enketo.org" target="_blank" rel="nofollow noopener">
          <EnketoLogo src={logo} />
        </a>
        <Text>{t.get(lang, (s) => s.routes.operations.forms.footer.and)}</Text>
        <a
          href="https://www.kobotoolbox.org"
          target="_blank"
          rel="nofollow noopener"
        >
          <KoboLogo />
        </a>
      </Box>
    )}
  </AppContext.Consumer>
);

export default PoweredByFooter;
