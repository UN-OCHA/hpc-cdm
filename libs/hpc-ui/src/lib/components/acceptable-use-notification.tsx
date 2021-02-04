import React from 'react';
import { styled } from '../theme';
import { Session } from '@unocha/hpc-core';

import User from '../assets/icons/user';
import { Button } from '../components/button';

interface Props {
  className?: string;
  session: Session;
  strings: {
    login: string;
    title: string;
    p1: string;
    p2: string;
    p3: string;
    p4: string;
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  h2 {
    margin: 1em 0 0;
    font-size: 1.7rem;
  }

  p {
    margin: 1em 0 0;
    font-size: 1.3rem;
  }
`;

const Actions = styled.div`
  flex-grow: 1;
  text-align: center;
`;

const AcceptableUseNotification = (props: Props) => (
  <Container className={props.className}>
    <Actions>
      <Button
        startIcon={User}
        onClick={props.session.logIn}
        color="secondary"
        text={props.strings.login}
      />
    </Actions>
    <h2>{props.strings.title}</h2>
    <p>
      {props.strings.p1} {props.strings.p2} {props.strings.p3}{' '}
      {props.strings.p4}
    </p>
  </Container>
);

export default AcceptableUseNotification;
