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

const Actions = styled.div`
  text-align: center;
`;

const AcceptableUseNotification = (props: Props) => (
  <div className={props.className}>
    <Actions>
      <Button
        startIcon={User}
        onClick={props.session.logIn}
        color="secondary"
        text={props.strings.login}
      />
    </Actions>
    <h2>{props.strings.title}</h2>
    <p>{props.strings.p1}</p>
    <p>{props.strings.p2}</p>
    <p>{props.strings.p3}</p>
    <p>{props.strings.p4}</p>
  </div>
);

export default AcceptableUseNotification;
