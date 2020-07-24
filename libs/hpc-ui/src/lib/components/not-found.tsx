import React from 'react';
import styled from 'styled-components';
import { Session } from '@unocha/hpc-core';

import { button, buttonPrimary } from '../mixins';

interface Props {
  className?: string;
  session: Session;
  strings: {
    title: string;
    info: string;
    back: string;
  };
}
const Component = (props: Props) => (
  <div className={props.className}>
    <h3>{props.strings.title}</h3>
    <p>{props.strings.info}</p>
    <button onClick={() => window.history.back()}>{props.strings.back}</button>
  </div>
);

export default styled(Component)`
  text-align: center;
  padding: ${(p) => p.theme.marginPx.md}px;

  button {
    ${button}
    ${buttonPrimary}
  }
`;
