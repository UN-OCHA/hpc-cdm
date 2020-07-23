import React from 'react';

import { CLASSES, C, combineClasses, styled, dataLoader } from '@unocha/hpc-ui';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  match: {
    params: {
      id: string;
    };
  };
  className?: string;
}

const Page = (props: Props) => {
  const id = parseInt(props.match.params.id);
  if (isNaN(id)) {
    // TODO: improve this
    return <>Not Found</>;
  }
  const loader = dataLoader([id], env.model.operations.getOperation);

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
              <h1>
                {t.t(lang, (s) => s.navigation.operations)} &gt;{' '}
                {data.data.name}
              </h1>
            )}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Page)``;
