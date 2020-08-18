import React, { useRef, useState } from 'react';
import { CircularProgress } from '@material-ui/core';

import { styled } from '@unocha/hpc-ui';
import { MdWarning } from 'react-icons/md';
import { IconType } from 'react-icons/lib';

const CLS = {
  ERROR: 'error',
};

interface Props {
  className?: string;
  size?: number;
  icon: IconType;
  onClick: () => Promise<void>;
}

const Button = styled.button`
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

type InternalState = 'idle' | 'loading' | 'error';

export const ActionableIconButton = (props: Props) => {
  const { className, icon: Icon, onClick, size = 24 } = props;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<InternalState>('idle');

  return (
    <Button
      className={className}
      onClick={() => {
        setState('loading');
        onClick()
          .then(() => setState('idle'))
          .catch((err) => {
            console.error(err);
            setState('error');
          });
      }}
    >
      {state === 'loading' ? (
        <CircularProgress size={size} />
      ) : (
        <>
          {state === 'error' && <MdWarning className={CLS.ERROR} size={size} />}
          <Icon size={size} />
        </>
      )}
    </Button>
  );
};
