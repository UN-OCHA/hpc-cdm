import tw from 'twin.macro';

export interface SectionProps {
  title: string;
  name: string;
  children: React.ReactNode;
}
const SectionTitle = tw.summary`
  uppercase
  font-bold
  text-2xl
  m-0
  text-black
  transition-all
  ease-out
  duration-500
  list-none
  cursor-pointer
  `;
const SectionContainer = tw.details`
    p-4
    open:[&>summary]:mb-6
    hover:bg-slate-100
    open:hover:bg-white
  `;

const InputContainer = tw.div`
  flex
  flex-wrap
  gap-8
  `;
const Section = ({ title, children }: SectionProps) => {
  return (
    <SectionContainer open>
      {title && <SectionTitle>{title}</SectionTitle>}
      <InputContainer>{children}</InputContainer>
    </SectionContainer>
  );
};
export default Section;
