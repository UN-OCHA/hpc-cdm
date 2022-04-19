import React, { useState } from 'react';
import { IconType } from 'react-icons/lib';
import { CircularProgress } from '@material-ui/core';
import { MdWarning } from 'react-icons/md';

import { Button, ButtonColor } from './button';

export type ActionableButtonState = 'idle' | 'loading' | 'error';

interface ActionableIconButtonProps {
  color?: ButtonColor;
  className?: string;
  state?: ActionableButtonState;
  icon: IconType;
  onClick: () => Promise<void>;
}

export const ActionableIconButton = (props: ActionableIconButtonProps) => {
  const { color = 'secondary', icon: Icon, onClick, state } = props;
  const [internalState, setInternalState] =
    useState<ActionableButtonState>('idle');

  const effectiveState = state || internalState;

  const buttonProps = {
    color,
    onClick: () => {
      setInternalState('loading');
      onClick()
        .then(() => setInternalState('idle'))
        .catch((err) => {
          console.error(err);
          setInternalState('error');
        });
    },
    condensed: true,
  };

  return effectiveState === 'loading' ? (
    <Button {...buttonProps} active>
      <CircularProgress size={16} color="inherit" />
    </Button>
  ) : (
    <Button
      startIcon={effectiveState === 'error' ? MdWarning : undefined}
      endIcon={Icon}
      {...buttonProps}
    />
  );
};

interface ActionableButtonProps {
  color?: ButtonColor;
  className?: string;
  size?: 'normal' | 'big';
  state?: ActionableButtonState;
  icon?: IconType;
  label: string;
  loadingLabel?: string;
  onClick: () => Promise<void>;
}

export const ActionableButton = (props: ActionableButtonProps) => {
  const {
    color = 'secondary',
    icon,
    onClick,
    state,
    label,
    loadingLabel,
  } = props;
  const [internalState, setInternalState] =
    useState<ActionableButtonState>('idle');

  const effectiveState = state || internalState;

  const buttonProps = {
    color,
    onClick: () => {
      setInternalState('loading');
      onClick()
        .then(() => setInternalState('idle'))
        .catch((err) => {
          console.error(err);
          setInternalState('error');
        });
    },
    startIcon: icon,
  };

  return effectiveState === 'loading' ? (
    <Button {...buttonProps} active text={loadingLabel}>
      <CircularProgress size={16} color="inherit" />
    </Button>
  ) : (
    <Button
      {...buttonProps}
      endIcon={effectiveState === 'error' ? MdWarning : undefined}
      text={label}
    />
  );
};
