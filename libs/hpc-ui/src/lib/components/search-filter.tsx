import React, { useCallback, useState } from 'react';
import { styled } from '../theme';
import tw from 'twin.macro';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Drawer, IconButton, Tooltip } from '@mui/material';
import { organizations } from '@unocha/hpc-data';
interface Props {
  className?: string;
  title?: string;
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
  }: organizations.GetOrganizationsAutocompleteParams) => Promise<organizations.GetOrganizationsResult>;
  selectFields?: { value: string | number; name: string }[];
}

const Container = tw.div`
  p-4
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
const StyledDrawer = tw(Drawer)`
  sticky
  top-0
  z-0
  overflow-y-visible
  h-screen
  [&>div]:relative
  [&>div]:border-y-0
  [&>div]:border-s-0
  [&>div]:border-e
  [&>div]:w-full
`;
const Dragger = tw.div`
  cursor-col-resize
  -me-[1px]
  hover:bg-unocha-pallete-gray-light2
  duration-150
  sticky
  z-10
`;

const HideDrawerButton = styled.button`
  ${({ autoFocus }) => (!autoFocus ? tw`-ms-[15px] ` : tw`me-4`)}
  ${tw`
  sticky
  top-1/2
  cursor-pointer
  [&>svg]:self-center
  h-16
  transition-all
  border-solid
  border-s-0
  border-y
  border-e
  border-unocha-primary-dark2
  rounded-e-md
  bg-unocha-primary
  p-0
`}
`;

export const SearchFilter = ({ className, title, children }: Props) => {
  const [isOpen, setOpen] = useState(false);

  const defaultDrawerWidth = 280;
  const minDrawerWidth = 260;
  const maxDrawerWidth = 600;

  const [drawerWidth, setDrawerWidth] = React.useState(defaultDrawerWidth);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setIsDragging(true);

    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('mousemove', handleMouseMove, true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newWidth = e.clientX - document.body.offsetLeft;
    if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
      setDrawerWidth(newWidth);
    }
  }, []);

  return (
    <>
      <StyledDrawer
        variant="persistent"
        anchor="left"
        open={isOpen}
        sx={{
          width: isOpen ? drawerWidth : 0,
          transitionProperty: !isDragging ? 'all' : undefined,
          transitionTimingFunction: !isDragging
            ? 'cubic-bezier(0.4, 0, 0.2, 1)'
            : undefined,
          transitionDuration: !isDragging ? '150ms' : undefined,
        }}
        PaperProps={{
          variant: 'outlined',
          style: {
            width: isDragging ? drawerWidth : undefined,
          },
        }}
      >
        <Container className={className}>
          <FlexDiv>
            {title && <Title>{title}</Title>}
            <IconButton aria-label="close" onClick={() => setOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </FlexDiv>
          {children}
        </Container>
      </StyledDrawer>
      <Dragger
        onMouseDown={(e) => handleMouseDown(e)}
        style={{ width: isOpen ? '3px' : '0px' }}
      />
      <Tooltip title="Filters">
        <HideDrawerButton onClick={() => setOpen(!isOpen)} autoFocus={isOpen}>
          <ChevronLeftIcon
            sx={{
              transition: 'all .3s',
              transform: 'initial',
              rotate: isOpen ? '0deg' : '180deg',
              color: 'white',
            }}
          />
        </HideDrawerButton>
      </Tooltip>
    </>
  );
};

export default SearchFilter;
