import React, { useState, useEffect } from 'react';

import { CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import { Operations } from '@unocha/hpc-data';

import env from '../../environments/environment';
import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  className?: string;
}

const Page = (props: Props) => {
  const [
    operations,
    setOperations,
  ] = useState<null | Operations.GetOperationsResult>(null);

  useEffect(() => {
    env.model.operations.getOperations().then(setOperations);
  }, []);

  console.log(operations);

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(
            CLASSES.CONTAINER.CENTERED,
            props.className
          )}
        >
          {operations ? (
            <>
              <h1>{t.t(lang, (s) => s.navigation.operations)}</h1>
              <ul>
                {operations.data.map((o, i) => (
                  <li key={i}>{o.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <h1>Loading</h1>
          )}
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Page)``;
