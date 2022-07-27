import React from 'react';
import {
  MenuItem,
  Popper,
  ClickAwayListener,
  MenuList,
  Paper,
  Grow,
} from '@mui/material';

import Caret from '../assets/icons/caret';
import { MdLanguage } from 'react-icons/md';
import { i18n } from '@unocha/hpc-core';

import HeaderButton from './header-button';

interface Props<LanguageKey extends string> {
  className?: string;
  choice: i18n.LanguageChoice<LanguageKey>;
}

interface State<LanguageKey> {
  open: boolean;
  lang: LanguageKey;
}

class LanguagePicker<LanguageKey extends string> extends React.Component<
  Props<LanguageKey>,
  State<LanguageKey>
> {
  private menuAnchor: HTMLButtonElement | null = null;

  public constructor(props: Props<LanguageKey>) {
    super(props);
    this.state = {
      open: false,
      lang: props.choice.getLanguage(),
    };
  }

  private languageChanged = (lang: LanguageKey) => {
    this.setState({ lang });
  };

  public componentDidMount() {
    this.props.choice.addListener(this.languageChanged);
  }

  public componentWillUnmount() {
    this.props.choice.removeListener(this.languageChanged);
  }

  public render = () => {
    const { choice } = this.props;
    const { open, lang } = this.state;
    return (
      <>
        <HeaderButton
          ref={(ref) => (this.menuAnchor = ref)}
          onClick={() => this.setState({ open: true })}
        >
          <MdLanguage size={18} />
          <span>{lang.toLocaleUpperCase()}</span>
          <Caret direction={open ? 'up' : 'down'} />
        </HeaderButton>
        <Popper
          open={open}
          anchorEl={this.menuAnchor}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
                <ClickAwayListener
                  onClickAway={() => this.setState({ open: false })}
                >
                  <MenuList autoFocusItem={open}>
                    {choice.getLanguages().map(({ key, name }) => (
                      <MenuItem
                        onClick={() => {
                          this.setState({ open: false });
                          choice.setLanguage(key);
                        }}
                        selected={key === lang}
                      >
                        {name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    );
  };
}

export default LanguagePicker;
