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
  isLeftSection?: boolean;
  isRightSection?: boolean;
  children: React.ReactNode;
}

const FormSection = ({
  title,
  isLeftSection,
  isRightSection,
  children,
}: SectionProps) => {
  const containerInlineStyle = useMemo(
    () => ({
      maxWidth: 'none',
      ...(isLeftSection
        ? {
            paddingRight: '0.75rem',
          }
        : {}),
      ...(isRightSection
        ? {
            paddingLeft: '0.75rem',
          }
        : {}),
    }),
    [isLeftSection, isRightSection]
  );
  const cardInlineStyle = useMemo(
    () => tw`shadow-[0_3px_10px_rgb(0,0,0,0.2)]`,
    []
  );

  return (
    <Container style={containerInlineStyle}>
      <Card variant="outlined" sx={cardInlineStyle}>
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
