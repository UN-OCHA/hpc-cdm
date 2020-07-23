import React from 'react';

import {
  CLASSES,
  C,
  combineClasses,
  styled,
  simpleDataLoader,
} from '@unocha/hpc-ui';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  className?: string;
}

const Page = (props: Props) => {
  const loader = simpleDataLoader(env.model.operations.getOperations);

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
            strings={t.get(lang, (s) => s.components.loader)}
          >
            {(data) => (
              <>
                <h1>{t.t(lang, (s) => s.navigation.operations)}</h1>
                <ul>
                  {data.data.map((o, i) => (
                    <li key={i}>{o.name}</li>
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

export default styled(Page)``;
