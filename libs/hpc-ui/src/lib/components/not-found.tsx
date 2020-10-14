import React from 'react';

import { Button } from './button';
import ErrorMessage from './error-message';

interface Props {
  className?: string;
  strings: {
    title: string;
    info: string;
    back: string;
  };
}

const NotFound = (props: Props) => (
  <ErrorMessage
    strings={props.strings}
    icon={false}
    buttons={
      <Button
        color="secondary"
        onClick={() => window.history.back()}
        text={props.strings.back}
      />
    }
  />
);

export default NotFound;
