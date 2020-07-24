import React from 'react';

import ErrorMessage from './error-message';

interface Props {
  className?: string;
  strings: {
    title: string;
    info: string;
    back: string;
  };
}

export default (props: Props) => (
  <ErrorMessage
    strings={props.strings}
    icon={false}
    buttons={
      <button onClick={() => window.history.back()}>
        {props.strings.back}
      </button>
    }
  />
);
