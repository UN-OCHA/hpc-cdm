import React, { useRef, useState } from 'react';
import {
  MenuItem,
  Popper,
  ClickAwayListener,
  MenuList,
  Paper,
  Grow,
  CircularProgress,
} from '@mui/material';

import { MdWarning, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { styled } from '../theme';
import Caret from '../assets/icons/caret';

const CLS = {
  ERROR: 'error',
  BUTTON: 'dropdown-button',
  CARET: 'caret',
};

interface Props {
  className?: string;
  label: string;
  loadingLabel: string;
  showCheckboxes?: boolean;
  options: Array<{
    label: string;
    key: string;
    selected?: boolean;
  }>;
  onSelect: (key: string) => Promise<void>;
}

const Wrapper = styled.div`
  > .${CLS.BUTTON} {
    height: 30px;
    display: inline-flex;
    padding: 0 ${(p) => p.theme.marginPx.md}px;
    box-sizing: border-box;
    background: none;
    border: 1px solid ${(p) => p.theme.colors.pallete.gray.light4};
    color: ${(p) => p.theme.colors.pallete.gray.normal};
    align-items: center;
    border-radius: 2px;
    font-size: 1.4rem;
    cursor: pointer;

    &:hover,
    &:focus {
      background-color: ${(p) => p.theme.colors.pallete.gray.light4};
    }

    > * {
      margin: 0 ${(p) => p.theme.marginPx.sm}px;
    }

    > .${CLS.CARET} {
      color: ${(p) => p.theme.colors.pallete.gray.light};
    }

    > .${CLS.ERROR} {
      color: ${(p) => p.theme.colors.textError};
    }
  }
`;

const MenuItemContents = styled.span`
  display: inline-flex;
  align-items: center;
  margin: 0 -${(p) => p.theme.marginPx.sm}px;

  > * {
    margin: 0 ${(p) => p.theme.marginPx.sm}px;
  }
`;

type InternalState = 'idle' | 'loading' | 'error';

/**
 * A drop-down component that is designed to perform an "action" when a user
 * selects a new option, and display a loading indicator.
 */
export const ActionableDropdown = (props: Props) => {
  const { className, label, loadingLabel, showCheckboxes, options, onSelect } =
    props;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<InternalState>('idle');

  return (
    <Wrapper className={className}>
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
            <Caret
              className={CLS.CARET}
              direction={open ? 'up' : 'down'}
              size={12}
            />
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
                      <MenuItemContents>
                        {showCheckboxes &&
                          (item.selected ? (
                            <MdCheckBox />
                          ) : (
                            <MdCheckBoxOutlineBlank />
                          ))}
                        {item.label}
                      </MenuItemContents>
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

export default ActionableDropdown;
