import React, { useContext } from 'react';

import { styled } from '@unocha/hpc-ui';
import logo from '../../../assets/logos/enketologo.png';
import { ReactComponent as KLogo } from '../../../assets/logos/kobologo.svg';
import { AppContext } from '../../context';
import { t } from '../../../i18n';

const Box = styled.div`
  display: flex;
  justify-content: flex-end;

  > span {
    font-size: 16px; //min required by enketo
    padding: 0 2px;
    align-self: center;
  }
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

const PoweredByFooter = () => {
  const { lang } = useContext(AppContext);
  return (
    <Box>
      {t.c(lang, (s) => s.routes.operations.forms.poweredByFooter, {
        enketo: (key) => (
          <a
            key={key}
            href="https://enketo.org"
            target="_blank"
            rel="nofollow noopener"
          >
            <EnketoLogo src={logo} />
          </a>
        ),
        kobotoolbox: (key) => (
          <a
            key={key}
            href="https://www.kobotoolbox.org"
            target="_blank"
            rel="nofollow noopener"
          >
            <KoboLogo />
          </a>
        ),
      })}
    </Box>
  );
};

export default PoweredByFooter;
