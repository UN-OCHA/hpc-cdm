import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
  MenuItem,
  Popper,
  ClickAwayListener,
  MenuList,
  Paper,
  Grow,
} from '@material-ui/core';

import { CLASSES, combineClasses } from './classes';
import UNOCHA from './icons/logos/unocha';
import Caret from './icons/caret';
import { Session } from '@unocha/hpc-core';
import { MdPermIdentity } from 'react-icons/md';

const CLS = {
  LOGO: 'logo',
  USER_CONTROLS: 'user-controls',
} as const;

interface Props {
  className?: string;
  session: Session;
}

const Header = (props: Props) => {
  const { className, session } = props;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuAnchor = useRef<HTMLButtonElement>(null);

  const user = () => {
    const u = session.getUser();
    if (u) {
      return (
        <div className={CLS.USER_CONTROLS}>
          <button
            ref={userMenuAnchor}
            className={combineClasses(
              CLASSES.BUTTON.CLEAR,
              CLASSES.BUTTON.WITH_ICON
            )}
            onClick={() => setUserMenuOpen(true)}
          >
            <MdPermIdentity size={18} />
            <span>{u.name}</span>
            <Caret direction={userMenuOpen ? 'up' : 'down'} />
          </button>
          <Popper
            open={userMenuOpen}
            anchorEl={userMenuAnchor.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps}>
                <Paper>
                  <ClickAwayListener onClickAway={() => setUserMenuOpen(false)}>
                    <MenuList autoFocusItem={userMenuOpen}>
                      <MenuItem onClick={session.logOut}>Logout</MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      );
    } else {
      return (
        <div className={CLS.USER_CONTROLS}>
          <button
            className={combineClasses(
              CLASSES.BUTTON.CLEAR,
              CLASSES.BUTTON.WITH_ICON
            )}
            onClick={session.logIn}
          >
            <MdPermIdentity />
            <span>Login</span>
          </button>
        </div>
      );
    }
  };

  return (
    <nav
      className={combineClasses(
        className,
        CLASSES.CONTAINER.FLUID,
        CLASSES.FLEX.CONTAINER
      )}
    >
      <UNOCHA className={CLS.LOGO} />
      <div className={CLASSES.FLEX.GROW} />
      {user()}
    </nav>
  );
};

export default styled(Header)`
  background: #026cb6;
  background-image: linear-gradient(-180deg, #026cb6 67%, #025995 97%);
  min-height: 40px;

  .${CLS.LOGO} {
    width: 30px;
  }

  .${CLS.USER_CONTROLS} {
  }
`;
