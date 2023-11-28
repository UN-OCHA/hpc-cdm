import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import tw from 'twin.macro';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { IconButton, SvgIconProps } from '@mui/material';

interface AsyncIconButtonProps {
  fnPromise: () => Promise<void>;
  IconComponent: React.FC<SvgIconProps>;
}

const AsyncIconButton = ({
  IconComponent,
  fnPromise,
}: AsyncIconButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);

  const buttonSx = {
    ...(success && tw`disabled:bg-unocha-success-light`),
    ...(error && tw`disabled:bg-unocha-error-light`),
  };

  React.useEffect(() => {
    if (success || error) {
      setTimeout(() => {
        setSuccess(false);
        setError(false);
      }, 1500);
    }
  }, [success, error]);
  const handleButtonClick = async () => {
    if (!loading) {
      setSuccess(false);
      setError(false);
      setLoading(true);
      try {
        const e = await fnPromise();
        console.log(e);
        setSuccess(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ m: 1, position: 'relative' }}>
        <IconButton
          disabled={success || error}
          size="small"
          sx={buttonSx}
          onClick={handleButtonClick}
        >
          {success ? (
            <CheckIcon />
          ) : error ? (
            <ErrorOutlineIcon />
          ) : (
            <IconComponent />
          )}
        </IconButton>
        {loading && (
          <CircularProgress
            size={34}
            sx={{
              ...{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
              },
              ...tw`text-unocha-primary`,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default AsyncIconButton;
