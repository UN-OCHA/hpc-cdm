import tw from 'twin.macro';
import React, { useMemo } from 'react';
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

const FormSection = ({ title, children }: SectionProps) => {
  const containerInlineStyle = useMemo(
    () => ({
      maxWidth: 'none',
    }),
    []
  );

  return (
    <Container style={containerInlineStyle}>
      <Card variant="outlined">
        <CardHeader title={<Typography variant="h5">{title}</Typography>} />
        <CardContent>{children}</CardContent>
      </Card>
    </Container>
  );
};

FormSection.defaultProps = {
  type: 'primary',
};
export default FormSection;
