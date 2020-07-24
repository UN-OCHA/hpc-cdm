import React from 'react';
import {
  MenuItem,
  Popper,
  ClickAwayListener,
  MenuList,
  Paper,
  Grow,
} from '@material-ui/core';

import { CLASSES, combineClasses } from '../classes';
import Caret from '../icons/caret';
import { MdLanguage } from 'react-icons/md';
import { i18n } from '@unocha/hpc-core';

const CLS = {
  LOGO: 'logo',
  USER_CONTROLS: 'user-controls',
} as const;

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
      <div className={CLS.USER_CONTROLS}>
        <button
          ref={(ref) => (this.menuAnchor = ref)}
          className={combineClasses(
            CLASSES.BUTTON.CLEAR,
            CLASSES.BUTTON.WITH_ICON
          )}
          onClick={() => this.setState({ open: true })}
        >
          <MdLanguage size={18} />
          <span>{lang.toLocaleUpperCase()}</span>
          <Caret direction={open ? 'up' : 'down'} />
        </button>
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
      </div>
    );
  };
}

export default LanguagePicker;