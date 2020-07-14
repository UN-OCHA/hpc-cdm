import React from 'react';
import styled from 'styled-components';
import { Session } from '@unocha/hpc-core';

import { MdPermIdentity } from 'react-icons/md';

import { CLASSES, combineClasses } from '../classes';

interface Props {
  className?: string;
  session: Session;
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
        <span>Click here to login</span>
      </button>
    </div>
    <h2>Acceptable Use Notification</h2>
    <p>
      Unauthorized access to this United Nations Computer System is prohibited
      by ST/SGB/2004/15 (''Use of information and communication technology
      resources and data" of 29 November 2004).
    </p>
    <p>
      Authorized users shall ensure that their use of Information and
      Communication Technology (ICT) resources and ICT data is consistent with
      their obligations as staff members or such other obligations as may apply
      to them.
    </p>
    <p>
      All use of ICT resources and ICT data is subject to monitoring and
      investigation as set forth in ST/SGB/2004/15.
    </p>
    <p>
      Use of this system by any user, authorized or unauthorized, constitutes
      consent to the applicable UN regulations and rules.
    </p>
  </div>
);

export default styled(AcceptableUseNotification)``;
