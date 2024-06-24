import React from 'react';

import { CLASSES, C, combineClasses, dataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';
import PageMeta from '../components/page-meta';

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
          <PageMeta title={[t.t(lang, (s) => s.navigation.operations)]} />
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
                    .sort((o1: { name: string }, o2: { name: string }) =>
                      o1.name.toLowerCase().localeCompare(o2.name.toLowerCase())
                    )
                    .map((o: { id: number; name: string }) => (
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
