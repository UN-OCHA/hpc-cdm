import React from 'react';
import { Link } from 'react-router-dom';

import { CLASSES, C, combineClasses, styled, dataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

interface Props {
  className?: string;
}

export default (props: Props) => {
  const loader = dataLoader([], getEnv().model.operations.getOperations);

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
                <C.PageTitle>
                  {t.t(lang, (s) => s.navigation.operations)}
                </C.PageTitle>
                <C.List>
                  {data.data.map((o, i) => (
                    <C.ListItem
                      key={i}
                      text={o.name}
                      link={paths.operation(o.id)}
                    />
                  ))}
                </C.List>
              </>
            )}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};
