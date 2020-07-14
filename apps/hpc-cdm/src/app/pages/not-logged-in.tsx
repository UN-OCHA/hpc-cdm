import React from 'react';
import styled from 'styled-components';

import {
  AcceptableUseNotification,
  CLASSES,
  combineClasses,
} from '@unocha/hpc-ui';

import env from '../../environments/environment';

interface Props {
  className?: string;
}

const PageNotLoggedIn = (props: Props) => (
  <div className={combineClasses(CLASSES.CONTAINER.CENTERED, props.className)}>
    <AcceptableUseNotification session={env.session} />
  </div>
);

export default styled(PageNotLoggedIn)`
  padding-top: 40px;
  padding-bottom: 40px;
`;
