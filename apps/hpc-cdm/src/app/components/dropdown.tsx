import React, { useRef, useState } from 'react';
import {
  MenuItem,
  Popper,
  ClickAwayListener,
  MenuList,
  Paper,
  Grow,
  CircularProgress,
} from '@material-ui/core';

import { styled, ICONS, mixins, combineClasses } from '@unocha/hpc-ui';
import { MdWarning } from 'react-icons/md';

const CLS = {
  ERROR: 'error',
  BUTTON: 'dropdown-button',
};

interface Props {
  className?: string;
  label: string;
  loadingLabel: string;
  options: Array<{
    label: string;
    key: string;
  }>;
  onSelect: (key: string) => Promise<void>;
  colors: 'gray';
}

const Wrapper = styled.div`
  > .${CLS.BUTTON} {
    ${mixins.button};

    > * {
      margin: 0 3px;
    }

    > .${CLS.ERROR} {
      color: ${(p) => p.theme.colors.textError};
    }
  }

  &.colors-gray {
    > .${CLS.BUTTON} {
      ${mixins.buttonGray};
    }
  }
`;

type InternalState = 'idle' | 'loading' | 'error';

/**
 * A drop-down component that is designed to perform an "action" when a user
 * selects a new option, and display a loading indicator.
 */
export const ActionableDropdown = (props: Props) => {
  const { className, colors, label, loadingLabel, options, onSelect } = props;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<InternalState>('idle');

  return (
    <Wrapper className={combineClasses(className, `colors-${colors}`)}>
      <button
        ref={buttonRef}
        className={CLS.BUTTON}
        onClick={() => setOpen(true)}
      >
        {state === 'loading' ? (
          <>
            <span>{loadingLabel}</span>
            <CircularProgress size={15} />
          </>
        ) : (
          <>
            {state === 'error' && <MdWarning className={CLS.ERROR} size={15} />}
            <span>{label}</span>
            <ICONS.Caret direction={open ? 'up' : 'down'} />
          </>
        )}
      </button>
      <Popper
        open={open}
        anchorEl={buttonRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList autoFocusItem={open}>
                  {options.map((item) => (
                    <MenuItem
                      key={item.key}
                      onClick={() => {
                        setOpen(false);
                        setState('loading');
                        onSelect(item.key)
                          .then(() => setState('idle'))
                          .catch((err) => {
                            console.error(err);
                            setState('error');
                          });
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Wrapper>
  );
};
