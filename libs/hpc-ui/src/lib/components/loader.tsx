import React, { ReactElement } from 'react';

import { DataLoaderState } from '../util';
import { CircularProgress } from '@material-ui/core';
import { styled } from '../theme';
import { button, buttonPrimary } from '../mixins';

interface Props<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (data: T) => ReactElement<any, any>;
  className?: string;
  loader: DataLoaderState<T>;
  strings: {
    loading: string;
    error: string;
  };
}

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${(p) => p.theme.marginPx.md}px;

  button {
    ${button}
    ${buttonPrimary}
  }
`;

export default function Component<T>(props: Props<T>) {
  const { children, className, loader, strings } = props;
  return loader.type === 'success' ? (
    children(loader.data)
  ) : loader.type === 'error' ? (
    <StyledDiv className={className}>
      {/* TODO: use a translation string with a placeholder instead of string concatenation */}
      <h3>
        {strings.error} {loader.error}
      </h3>
      <button onClick={loader.retry}>Retry</button>
    </StyledDiv>
  ) : (
    <StyledDiv className={className}>
      <h3>{strings.loading}</h3>
      <CircularProgress />
    </StyledDiv>
  );
}
