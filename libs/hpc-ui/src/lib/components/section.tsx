import tw from 'twin.macro';
import Caret from '../assets/icons/caret';
import React from 'react';
import { styled } from '../theme';

export interface SectionProps {
  title: string;
  type: 'primary' | 'secondary';
  children: React.ReactNode;
}

const SectionTitle = styled.summary(
  ({ type }: { type: 'primary' | 'secondary' }) => [
    tw`font-bold
  m-0
  transition-all
  ease-out
  duration-500
  list-none
  cursor-pointer
  [&::-webkit-details-marker]:hidden
  `,
    type === 'primary'
      ? tw`flex
      justify-between 
      uppercase
      font-bold
      text-2xl
      text-unocha-pallete-blue-dark2`
      : tw`text-right [&>svg]:ms-2 text-unocha-pallete-blue text-xl `,
  ]
);
const SectionContainer = styled.details(
  ({ type }: { type: 'primary' | 'secondary' }) => [
    tw`open:[&>summary]:mb-6`,
    type === 'primary'
      ? tw`p-4 hover:bg-unocha-panel-bgHover open:hover:bg-white`
      : tw`p-0 w-full`,
  ]
);

const Container = tw.div`
  flex
  flex-wrap
  gap-8
  `;
const Section = ({ title, type, children }: SectionProps) => {
  const [open, setOpen] = React.useState(type !== 'primary');

  return (
    <SectionContainer type={type} open={type === 'primary'}>
      <SectionTitle type={type} onClick={() => setOpen(!open)}>
        {title}
        <Caret
          direction={open ? 'up' : 'down'}
          size={type === 'primary' ? 12 : 10}
        />
      </SectionTitle>

      <Container>{children}</Container>
    </SectionContainer>
  );
};

Section.defaultProps = {
  type: 'primary',
};
export default Section;
