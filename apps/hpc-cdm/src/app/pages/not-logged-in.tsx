import React from 'react';

import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  className?: string;
}

const PageNotLoggedIn = (props: Props) => (
  <AppContext.Consumer>
    {({ lang, env }) => (
      <div
        className={combineClasses(CLASSES.CONTAINER.CENTERED, props.className)}
      >
        <C.AcceptableUseNotification
          session={env().session}
          strings={t.get(lang, (s) => s.components.acceptableUseNotification)}
        />
      </div>
    )}
  </AppContext.Consumer>
);

export default styled(PageNotLoggedIn)`
  padding-top: 40px;
  padding-bottom: 40px;
`;
