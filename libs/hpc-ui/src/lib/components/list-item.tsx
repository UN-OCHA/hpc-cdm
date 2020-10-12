import React from 'react';
import { Link } from 'react-router-dom';
import { CLASSES, combineClasses } from '../classes';
import Caret from '../assets/icons/caret';
import { styled } from '../theme';

const CLS = {
  TEXT: 'text',
  LINK: 'link',
  LINK_CARET: 'link-caret',
};

interface Props {
  className?: string;
  /**
   * If set, the entire item becomes an interactive link to the given path
   */
  link?: string;
  text: string;
  /**
   * If set, display this element as secondary information after the
   */
  secondary?: JSX.Element;
}

const Text = styled.span`
  font-weight: bold;
  color: ${(p) => p.theme.colors.text};
`;

const SecondaryDiv = styled.div`
  height: 13px;
  border-left: 1px solid ${(p) => p.theme.colors.dividers};
  margin: 0 ${(p) => p.theme.marginPx.lg}px;
`;

const Secondary = styled.span`
  color: ${(p) => p.theme.colors.pallete.gray.light};
  font-weight: bold; // TODO: make semi-bold with supported font
`;

const ListItem = (props: Props) => {
  const { className, link, text, secondary } = props;
  const contents = (
    <>
      <Text>{text}</Text>
      {secondary && (
        <>
          <SecondaryDiv />
          <Secondary>{secondary}</Secondary>
        </>
      )}
      <div className={CLASSES.FLEX.GROW} />
    </>
  );

  return link ? (
    <Link to={link} className={combineClasses(className, CLS.LINK)}>
      {contents}
      <Caret className={CLS.LINK_CARET} direction="right" height={11} />
    </Link>
  ) : (
    <div className={className}>{contents}</div>
  );
};

export default styled(ListItem)`
  display: flex;
  align-items: center;
  height: 68px;
  border-bottom: 1px solid ${(p) => p.theme.colors.dividers};
  padding: 0 0;
  transition: padding ${(p) => p.theme.animations.fast};

  &.${CLS.LINK}:hover, &.${CLS.LINK}:focus {
    outline: none;
    background: ${(p) => p.theme.colors.pallete.gray.light5};
    text-decoration: none;
    padding: 0 ${(p) => p.theme.marginPx.sm}px 0 ${(p) => p.theme.marginPx.md}px;
  }

  > .${CLS.LINK_CARET} {
    color: ${(p) => p.theme.colors.secondary.normal};
    margin: 0 ${(p) => p.theme.marginPx.md}px;
  }
`;
