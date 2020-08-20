import React, { useState } from 'react';
import { CircularProgress } from '@material-ui/core';

import { styled, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { MdWarning } from 'react-icons/md';
import { IconType } from 'react-icons/lib';

const CLS = {
  ERROR: 'error',
};

export type InternalState = 'idle' | 'loading' | 'error';

interface ActionableIconButtonProps {
  className?: string;
  size?: number;
  state?: InternalState;
  icon: IconType;
  onClick: () => Promise<void>;
}

const IconButton = styled.button`
  border: none;
  background: none;
  outline: none;
  cursor: pointer;

  > .${CLS.ERROR} {
    color: ${(p) => p.theme.colors.textError};
  }

  &:hover {
    opacity: 0.7;
  }
`;

export const ActionableIconButton = (props: ActionableIconButtonProps) => {
  const { className, icon: Icon, onClick, size = 24, state } = props;
  const [internalState, setInternalState] = useState<InternalState>('idle');

  const effectiveState = state || internalState;

  return (
    <IconButton
      className={className}
      onClick={() => {
        setInternalState('loading');
        onClick()
          .then(() => setInternalState('idle'))
          .catch((err) => {
            console.error(err);
            setInternalState('error');
          });
      }}
    >
      {effectiveState === 'loading' ? (
        <CircularProgress size={size} />
      ) : (
        <>
          {effectiveState === 'error' && (
            <MdWarning className={CLS.ERROR} size={size} />
          )}
          <Icon size={size} />
        </>
      )}
    </IconButton>
  );
};

interface ActionableButtonProps {
  className?: string;
  size?: 'normal' | 'big';
  state?: InternalState;
  icon?: IconType;
  label: string;
  loadingLabel?: string;
  onClick: () => Promise<void>;
}

export const ActionableButton = (props: ActionableButtonProps) => {
  const {
    className,
    icon: Icon,
    onClick,
    size = 'normal',
    state,
    label,
    loadingLabel,
  } = props;
  const [internalState, setInternalState] = useState<InternalState>('idle');

  const effectiveState = state || internalState;

  return (
    <button
      className={combineClasses(
        className,
        CLASSES.BUTTON.PRIMARY,
        size === 'big' ? CLASSES.BUTTON.WITH_ICON_BIG : CLASSES.BUTTON.WITH_ICON
      )}
      onClick={() => {
        setInternalState('loading');
        onClick()
          .then(() => setInternalState('idle'))
          .catch((err) => {
            console.error(err);
            setInternalState('error');
          });
      }}
    >
      {effectiveState === 'loading' ? (
        <>
          <CircularProgress size={24} color="inherit" />
          {loadingLabel && <span>{loadingLabel}</span>}
        </>
      ) : effectiveState === 'error' ? (
        <>
          <MdWarning className={CLS.ERROR} size={20} />
          <span>{label}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={20} />}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
