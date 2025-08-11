import React from 'react';

import { C, CLASSES, combineClasses, useDataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { useTitle } from '../components/page-meta';
import { AppContext, getContext, getEnv } from '../context';
import * as paths from '../paths';

interface Props {
  className?: string;
}

export default (props: Props) => {
  const [loader] = useDataLoader([], getEnv().model.operations.getOperations);
  const { lang } = getContext();

  useTitle([t.t(lang, (s) => s.navigation.operations)]);

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
                  {data.data
                    .sort((o1, o2) =>
                      o1.name.toLowerCase().localeCompare(o2.name.toLowerCase())
                    )
                    .map((o) => (
                      <C.ListItem
                        key={o.id}
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
