import tw from 'twin.macro';
import React from 'react';
import { styled } from '../theme';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from '@mui/material';

export interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const StyledCardHeader = tw(CardHeader)`
  bg-unocha-primary-light
`;

const FormSection = ({ title, children }: SectionProps) => {
  return (
    <Container maxWidth="lg">
      <Card variant="outlined">
        <StyledCardHeader
          title={<Typography variant="h5">{title}</Typography>}
        />
        <CardContent>{children}</CardContent>
      </Card>
    </Container>
  );
};

FormSection.defaultProps = {
  type: 'primary',
};
export default FormSection;
