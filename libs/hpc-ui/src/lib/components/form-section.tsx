import tw from 'twin.macro';
import React from 'react';
import { styled } from '../theme';

export interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const SectionContainer = styled.fieldset`
  box-shadow: none;
  clear: both;
  border: 0;
  padding: 0;
  margin-left: 0;
  background-color: #fff;
`;

const SectionTitle = styled.legend`
  background-color: #49a0f1;
  border-top-right-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
  top: 0;
  height: 40px;
  line-height: 40px;
  text-transform: uppercase;
  color: #fafafa;
  width: 100%;
  text-align: center;
  margin: 0;
  padding: 0;
`;

const Container = tw.div`
  flex
  flex-wrap
  p-8
  box-border
  border-solid
  border
  border-t-0
  border-[#cccccc]
`;
const FormSection = ({ title, children }: SectionProps) => {
  return (
    <SectionContainer>
      <SectionTitle>{title}</SectionTitle>
      <Container>{children}</Container>
    </SectionContainer>
  );
};

FormSection.defaultProps = {
  type: 'primary',
};
export default FormSection;
