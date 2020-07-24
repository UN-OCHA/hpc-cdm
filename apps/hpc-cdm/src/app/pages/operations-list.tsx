import React from 'react';
import { Link } from 'react-router-dom';

import { CLASSES, C, combineClasses, styled, dataLoader } from '@unocha/hpc-ui';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

const CLS = {
  OPERATIONS: 'operations',
};

interface Props {
  className?: string;
}

const Page = (props: Props) => {
  const loader = dataLoader([], env.model.operations.getOperations);

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(
            CLASSES.CONTAINER.CENTERED,
            props.className
          )}
        >
          <C.Loader
            loader={loader}
            strings={{
              ...t.get(lang, (s) => s.components.loader),
              notFound: t.get(lang, (s) => s.components.notFound),
            }}
          >
            {(data) => (
              <>
                <C.Toolbar>
                  <C.Breadcrumbs
                    links={[
                      {
                        label: t.t(lang, (s) => s.navigation.operations),
                        to: paths.OPERATIONS,
                      },
                    ]}
                  />
                </C.Toolbar>
                <ul className={CLS.OPERATIONS}>
                  {data.data.map((o, i) => (
                    <li key={i}>
                      <Link to={paths.operation(o.id)}>{o.name}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Page)`
  .${CLS.OPERATIONS} {
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;

    li {
      display: block;
      margin: ${(p) => p.theme.marginPx.sm}px 0;

      a {
        display: block;
        padding: ${(p) => p.theme.marginPx.md}px;
        border: 1px solid ${(p) => p.theme.colors.panel.border};
        border-radius: ${(p) => p.theme.sizing.borderRadiusSm};
        background: ${(p) => p.theme.colors.panel.bg};
        font-size: 1.2rem;

        &:hover {
          background: ${(p) => p.theme.colors.panel.bgHover};
        }
      }
    }
  }
`;
