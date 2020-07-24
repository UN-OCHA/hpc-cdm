import React from 'react';
import { styled } from '../theme';
import { Session } from '@unocha/hpc-core';

import { MdPermIdentity } from 'react-icons/md';

import { CLASSES, combineClasses } from '../classes';

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

const AcceptableUseNotification = (props: Props) => (
  <div className={props.className}>
    <div className="title">
      <button
        className={combineClasses(
          CLASSES.BUTTON.PRIMARY,
          CLASSES.BUTTON.WITH_ICON
        )}
        onClick={props.session.logIn}
      >
        <MdPermIdentity />
        <span>{props.strings.login}</span>
      </button>
    </div>
    <h2>{props.strings.title}</h2>
    <p>{props.strings.p1}</p>
    <p>{props.strings.p2}</p>
    <p>{props.strings.p3}</p>
    <p>{props.strings.p4}</p>
  </div>
);

export default styled(AcceptableUseNotification)``;
