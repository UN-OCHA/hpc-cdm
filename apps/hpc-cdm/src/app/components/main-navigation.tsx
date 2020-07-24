import React from 'react';
import { Link } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';

import * as paths from '../paths';
import { t } from '../../i18n';
import { AppContext } from '../context';

const CLS = {
  HEADER: 'header',
};

interface Props {
  className?: string;
}

const Component = (props: Props) => {
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <C.Tabs
          className={props.className}
          mode="main"
          align="end"
          tabs={[
            {
              label: t.t(lang, (s) => s.navigation.operations),
              path: paths.OPERATIONS,
            },
            {
              label: t.t(lang, (s) => s.navigation.admin),
              path: paths.ADMIN,
            },
          ]}
        >
          <Link to={paths.HOME} className={CLS.HEADER}>
            {t.t(lang, (s) => s.title)}
          </Link>
        </C.Tabs>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Component)`
  .${CLS.HEADER} {
    line-height: 50px;
    margin: 0;
    font-size: 1.3rem;
  }
`;
