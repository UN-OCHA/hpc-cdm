import React from 'react';
import { styled } from '../theme';

interface Props {
  className?: string;
  title?: string;
  children?: JSX.Element | JSX.Element[];
}

const Container = styled.div`
  margin: ${(p) => p.theme.marginPx.md}px 0;
`;

const Title = styled.h2`
  text-transform: uppercase;
  font-size: 0.9rem;
  line-height: 40px;
  color: ${(p) => p.theme.colors.pallete.gray.light};
  border-bottom: 2px solid ${(p) => p.theme.colors.pallete.gray.light};
  margin: 0;
  padding: 0;
`;

const Divider = styled.div`
  border-bottom: 1px solid ${(p) => p.theme.colors.dividers};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export default ({ className, title, children }: Props) => (
  <div className={className}>
    {title ? <Title>{title}</Title> : <Divider />}
    <List>{children}</List>
  </div>
);
