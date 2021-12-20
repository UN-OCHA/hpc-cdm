import React from 'react';
import { CLASSES } from '../classes';
import { styled } from '../theme';

interface Props {
  className?: string;
  title?: string;
  children?: JSX.Element | JSX.Element[];
  actions?: JSX.Element | JSX.Element[];
}

const Header = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${(p) => p.theme.colors.pallete.gray.light};
  margin: 0;
  padding: 0;
`;

const Title = styled.h2`
  text-transform: uppercase;
  font-size: 1.2rem;
  line-height: ${(p) => p.theme.sizing.singleLineBlockItemHeightPx}px;
  margin: 0;
  color: ${(p) => p.theme.colors.pallete.gray.light};
`;

const Divider = styled.div`
  border-bottom: 1px solid ${(p) => p.theme.colors.dividers};
`;

const UL = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const List = ({ className, title, children, actions }: Props) => (
  <div className={className}>
    {title || actions ? (
      <Header>
        {title && <Title>{title}</Title>}
        <div className={CLASSES.FLEX.GROW} />
        {actions && <div>{actions}</div>}
      </Header>
    ) : (
      <Divider />
    )}
    <UL>{children}</UL>
  </div>
);

export default List;
