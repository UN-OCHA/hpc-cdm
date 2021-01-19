import React from 'react';
import styled from 'styled-components';
import logo from '../../../assets/logos/enketologo.png';
import { ReactComponent as KLogo } from '../../../assets/logos/kobologo.svg';

const Box = styled.span`
  float: right;
  margin-bottom: 16px;
`;

const EnketoText = styled.span`
  font-size: 16px;
  padding-right: 5px;
`;

const KoboText = styled.span`
  font-size: 16px;
  color: black;
`;

const Image = styled.img`
  height: 18px;
  position: relative;
  bottom: 5px;
  padding-right: 5px;
`;

const KoboLogo = styled(KLogo)`
  width: 120px;
  height: 30px;
  position: relative;
  bottom: -9px;
`;

const EnketoLogo = () => (
  <Box>
    <a href="https://enketo.org">
      <EnketoText>Powered by</EnketoText>
      <Image src={logo} />
    </a>
    <a href="https://www.kobotoolbox.org">
      <KoboText>and</KoboText>
      <KoboLogo />
    </a>
  </Box>
);

export default EnketoLogo;
