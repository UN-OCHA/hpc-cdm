import React from 'react';
import { styled } from '../theme';
import tw from 'twin.macro';
import { Drawer } from '@mui/material';
import { Button } from './button';
import { organizations } from '@unocha/hpc-data';
interface Props {
  className?: string;
  title?: string;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

export interface SearchFields {
  label: string;
  name: string;
  inputType: 'text' | 'number' | 'select';
  placeholder?: string;
  config?: FieldConfig;
}
interface FieldConfig {
  isMulti?: boolean;
  hasAutocomplete?: boolean;
  fnPromise?: ({
    query,
  }: organizations.GetOrganizationsAutocompleteParams) => Promise<organizations.GetOrganizationsAutocompleteResult>;
  selectFields?: { value: string | number; name: string }[];
}

const Container = styled.div`
  padding: 1rem;
  border-inline-end: 1px;
`;

const Title = styled.h2`
  text-transform: uppercase;
  font-size: 1.2rem;
  line-height: ${(p) => p.theme.sizing.singleLineBlockItemHeightPx}px;
  margin: 0;
  color: ${(p) => p.theme.colors.pallete.blue.dark2};
`;

const FlexDiv = tw.div`
flex
flex-wrap
justify-between
items-center
`;
const StyledDrawer = styled(Drawer)`
  ${({ open }) => (!open ? tw`w-0 opacity-0` : tw`w-1/4 opacity-100`)}
  ${tw`
me-8
z-0
[&>div]:relative
[&>div]:border-y-0
[&>div]:border-s-0
[&>div]:border-e
[&>div]:w-full
transition-all
`}
`;

export const SearchFilter = ({
  className,
  title,
  isOpen,
  setOpen,
  children,
}: Props) => {
  return (
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      elevation={0}
      PaperProps={{
        variant: 'outlined',
      }}
    >
      <Container className={className}>
        <FlexDiv>
          {title && <Title>{title}</Title>}
          <Button color="primary" text="X" onClick={() => setOpen(false)} />
        </FlexDiv>
        {children}
      </Container>
    </StyledDrawer>
  );
};

export default SearchFilter;
