import React from 'react';

import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';

import { AppContext } from '../context';
import { t } from '../../i18n';
import PageMeta from '../components/page-meta';

interface Props {
  className?: string;
}

const PageNotFound = (props: Props) => (
  <AppContext.Consumer>
    {({ lang }) => (
      <div
        className={combineClasses(CLASSES.CONTAINER.CENTERED, props.className)}
      >
        <PageMeta title={[t.t(lang, (s) => s.components.notFound.title)]} />
        <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
      </div>
    )}
  </AppContext.Consumer>
);

export default styled(PageNotFound)`
  padding-bottom: 40px;
`;
