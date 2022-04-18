import React from 'react';
import { Link } from 'react-router-dom';
import { CLASSES, combineClasses } from '../classes';
import Caret from '../assets/icons/caret';
import { styled } from '../theme';

const CLS = {
  TEXT: 'text',
  LINK: 'link',
  LINK_CARET: 'link-caret',
  MUTED: 'muted',
};

interface Props {
  className?: string;
  /**
   * If set, the entire item becomes an interactive link to the given path
   */
  link?: string;
  text: string;
  /**
   * If set, display this element as additional information before the main text
   */
  prefix?: JSX.Element | string;
  /**
   * If set, display this element as secondary information after the main text
   */
  secondary?: JSX.Element | string;
  /**
   * If set, display this element as additional information before the action
   */
  itemEnd?: JSX.Element;
  actions?: JSX.Element | JSX.Element[];
  muted?: boolean;
}

const Text = styled.span`
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};

  &.${CLS.MUTED} {
    color: ${(p) => p.theme.colors.textLight};
  }
`;

const Info = styled.span`
  color: ${(p) => p.theme.colors.pallete.gray.light};
  font-weight: 500;
`;

const Divider = styled.div`
  height: 13px;
  border-left: 1px solid ${(p) => p.theme.colors.dividers};
  margin: 0 ${(p) => p.theme.marginPx.lg}px;
`;

const PrefixDiv = styled.div`
  width: ${(p) => p.theme.marginPx.lg}px;
`;

const Actions = styled.div`
  display: flex;
  margin: 0 -4px;

  > * {
    margin: 0 4px;
  }
`;

const ListItem = (props: Props) => {
  const { className, link, text, prefix, secondary, actions, muted, itemEnd } =
    props;
  const contents = (
    <>
      {prefix && (
        <>
          <Info>{prefix}</Info>
          <PrefixDiv />
        </>
      )}
      <Text className={(muted && CLS.MUTED) || undefined}>{text}</Text>
      {secondary && (
        <>
          <Divider />
          <Info>{secondary}</Info>
        </>
      )}
      <div className={CLASSES.FLEX.GROW} />
      {itemEnd && (
        <>
          <Divider />
          {itemEnd}
        </>
      )}
      {actions && <Actions>{actions}</Actions>}
    </>
  );

  return link ? (
    <Link to={link} className={combineClasses(className, CLS.LINK)}>
      {contents}
      <Caret className={CLS.LINK_CARET} direction="end" size={11} />
    </Link>
  ) : (
    <div className={className}>{contents}</div>
  );
};

export default styled(ListItem)`
  display: flex;
  align-items: center;
  height: ${(p) => p.theme.sizing.singleLineBlockItemHeightPx}px;
  border-bottom: 1px solid ${(p) => p.theme.colors.dividers};
  padding: 0 0;
  transition: padding ${(p) => p.theme.animations.fast};

  &.${CLS.LINK}:hover, &.${CLS.LINK}:focus {
    outline: none;
    background: ${(p) => p.theme.colors.pallete.gray.light5};
    text-decoration: none;
    padding: 0 ${(p) => p.theme.marginPx.sm}px 0 ${(p) => p.theme.marginPx.md}px;

    [dir='rtl'] & {
      padding: 0 ${(p) => p.theme.marginPx.md}px 0
        ${(p) => p.theme.marginPx.sm}px;
    }
  }

  > .${CLS.LINK_CARET} {
    color: ${(p) => p.theme.colors.primary.normal};
    margin: 0 ${(p) => p.theme.marginPx.md}px;
  }
`;
