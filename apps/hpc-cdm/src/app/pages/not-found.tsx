import React from 'react';

import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';

import { AppContext } from '../context';
import { t } from '../../i18n';

interface Props {
  className?: string;
}

const Page = (props: Props) => (
  <AppContext.Consumer>
    {({ lang }) => (
      <div
        className={combineClasses(CLASSES.CONTAINER.CENTERED, props.className)}
      >
        <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
      </div>
    )}
  </AppContext.Consumer>
);

export default styled(Page)`
  padding-bottom: 40px;
`;
