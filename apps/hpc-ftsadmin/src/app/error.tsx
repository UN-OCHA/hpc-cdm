import ErrorIcon from '@mui/icons-material/Error';
import { Paper } from '@mui/material';
import { BaseStyling, ThemeProvider } from '@unocha/hpc-ui';
import { Link } from 'react-router';
import tw from 'twin.macro';

const PaperStyled = tw(Paper)`
px-6
py-4
text-white
bg-unocha-error
flex
flex-col
`;
const Fiv = tw.div`
mt-10
w-screen
flex
justify-center
`;
const LinkStyled = tw(Link)`
text-center
p-4
bg-unocha-error-light
rounded-sm
text-unocha-error
`;

export const ErrorBoundary = ({
  text,
  buttonProps,
}: {
  text: string;
  buttonProps: { href: string; text: string };
}) => {
  return (
    <ThemeProvider>
      <BaseStyling />
      <Fiv>
        <PaperStyled>
          <ErrorIcon />
          <p>{text}</p>
          <LinkStyled to={buttonProps.href}>{buttonProps.text}</LinkStyled>
        </PaperStyled>
      </Fiv>
    </ThemeProvider>
  );
};
