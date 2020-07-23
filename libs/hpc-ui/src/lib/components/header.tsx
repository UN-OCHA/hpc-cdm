import React, { useState, useRef } from 'react';
import {
  MenuItem,
  Popper,
  ClickAwayListener,
  MenuList,
  Paper,
  Grow,
} from '@material-ui/core';

import { Session } from '@unocha/hpc-core';
import { MdPermIdentity } from 'react-icons/md';
import { i18n } from '@unocha/hpc-core';

import { CLASSES, combineClasses } from '../classes';
import UNOCHA from '../icons/logos/unocha';
import Caret from '../icons/caret';
import LanguagePicker from '../components/language-picker';
import { styled } from '../theme';

const CLS = {
  LOGO: 'logo',
  USER_CONTROLS: 'user-controls',
} as const;

interface Props {
  className?: string;
  session: Session;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  language: i18n.LanguageChoice<any>;
  strings: {
    login: string;
  };
  userMenu: Array<{
    label: string;
    onClick: () => void;
  }>;
}

const Header = (props: Props) => {
  const { className, session, language, strings, userMenu } = props;
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
                      {userMenu.map((item, i) => (
                        <MenuItem
                          key={i}
                          onClick={() => {
                            setUserMenuOpen(false);
                            item.onClick();
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
            <span>{strings.login}</span>
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
      <LanguagePicker choice={language} />
      {user()}
    </nav>
  );
};

export default styled(Header)`
  background: ${(p) => p.theme.colors.secondary.dark1};
  background-image: linear-gradient(
    -180deg,
    ${(p) => p.theme.colors.secondary.dark1} 67%,
    ${(p) => p.theme.colors.secondary.dark2} 97%
  );
  min-height: 40px;

  .${CLS.LOGO} {
    width: 30px;
  }

  .${CLS.USER_CONTROLS} {
  }
`;
