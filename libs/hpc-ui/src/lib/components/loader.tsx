import React, { ReactElement } from 'react';
import { CircularProgress } from '@material-ui/core';

import { DataLoaderState } from '../util';
import { styled } from '../theme';
import { button, buttonPrimary } from '../mixins';

import NotFound from './not-found';

interface Props<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (data: T) => ReactElement<any, any>;
  className?: string;
  loader: DataLoaderState<T>;
  strings: {
    loading: string;
    error: string;
    notFound: {
      title: string;
      info: string;
      back: string;
    };
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

export default function Loader<T>(props: Props<T>) {
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
  ) : loader.type === 'not-found' ? (
    <NotFound strings={strings.notFound} />
  ) : (
    <StyledDiv className={className}>
      <h3>{strings.loading}</h3>
      <CircularProgress />
    </StyledDiv>
  );
}
