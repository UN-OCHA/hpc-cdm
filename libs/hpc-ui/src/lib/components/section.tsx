import React from 'react';
import tw from 'twin.macro';
import Caret from '../assets/icons/caret';
import { styled } from '../theme';

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  type?: 'primary' | 'secondary';
}
type SectionTypeProps = { type: 'primary' | 'secondary' };

const SectionTitle = styled.summary<SectionTypeProps>(({ type }) => [
  tw`
      font-bold
      m-0
      transition-all
      ease-out
      duration-500
      list-none
      cursor-pointer
      [&::-webkit-details-marker]:hidden
    `,
  type === 'primary'
    ? tw`
        flex
        justify-between 
        uppercase
        font-bold
        text-2xl
        text-unocha-pallete-blue-dark2
      `
    : tw`text-right [&>svg]:ms-2 text-unocha-pallete-blue text-xl`,
]);
const SectionContainer = styled.details<SectionTypeProps>(({ type }) => [
  tw`open:[&>summary]:mb-6`,
  type === 'primary'
    ? tw`p-4 hover:bg-unocha-panel-bgHover open:hover:bg-white`
    : tw`p-0 w-full`,
]);

const Container = tw.div`
  flex
  flex-wrap
  gap-8
`;
const Section = ({ title, type = 'primary', children }: SectionProps) => {
  const [isOpen, setIsOpen] = React.useState(type !== 'primary');

  return (
    <SectionContainer type={type} open={type === 'primary'}>
      <SectionTitle type={type} onClick={() => setIsOpen(!isOpen)}>
        {title}
        <Caret
          direction={isOpen ? 'up' : 'down'}
          size={type === 'primary' ? 12 : 10}
        />
      </SectionTitle>

      <Container>{children}</Container>
    </SectionContainer>
  );
};

export default Section;
