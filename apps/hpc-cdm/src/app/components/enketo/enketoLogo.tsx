import React from 'react';
import styled from 'styled-components';
import logo from '../../../assets/logos/enketo_bare_150x56.png';

const Link = styled.a`
  float: right;
`;

const Text = styled.span`
  font-size: 16px;
  padding-right: 5px;
`;

const Image = styled.img`
  height: 16px;
  margin-bottom: 5px;
`;

const EnketoLogo = () => (
  <Link href="https://enketo.org">
    <Text>Powered by</Text>
    <Image src={logo} />
  </Link>
);

export default EnketoLogo;
