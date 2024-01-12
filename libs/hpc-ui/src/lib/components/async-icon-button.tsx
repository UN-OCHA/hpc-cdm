import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import tw from 'twin.macro';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { IconButton, Modal, SvgIconProps, Tooltip } from '@mui/material';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';

interface AsyncIconButtonProps {
  fnPromise: () => Promise<void | unknown>;
  IconComponent: React.FC<SvgIconProps>;
  disabledText?: string;
  tooltipText?: string;
  confirmModal?: {
    text: string;
    principalButton: string;
    secondaryButton?: string;
  };
  iconSx?: React.CSSProperties;
  redirectAfterFetch?: string;
}

const ModalPaper = tw.div`
p-8 my-1 items-center bg-white max-w-3xl rounded-md
shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]
`;

const ButtonDiv = tw.div`
flex gap-x-4 my-4 justify-end
`;

const AsyncIconButton = ({
  IconComponent,
  fnPromise,
  disabledText,
  tooltipText,
  confirmModal,
  iconSx,
  redirectAfterFetch,
}: AsyncIconButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const navigate = useNavigate();
  const isDisabled = disabledText !== undefined;
  const buttonSx = {
    ...(success && tw`disabled:bg-unocha-success-light`),
    ...(error && tw`disabled:bg-unocha-error-light`),
    ...(isDisabled && tw`disabled:bg-opacity-40`),
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
      setConfirmed(false);
      try {
        await fnPromise();
        setSuccess(true);
        setLoading(false);
        if (redirectAfterFetch) {
          navigate(redirectAfterFetch);
        }
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={disabledText || tooltipText}>
          <Box sx={{ m: 1, position: 'relative' }}>
            <IconButton
              disabled={success || error || isDisabled}
              size="small"
              sx={buttonSx}
              onClick={
                confirmModal ? () => setConfirmed(true) : handleButtonClick
              }
            >
              {success ? (
                <CheckIcon sx={iconSx} />
              ) : error ? (
                <ErrorOutlineIcon sx={iconSx} />
              ) : (
                <IconComponent sx={iconSx} />
              )}
            </IconButton>

            {loading && (
              <CircularProgress
                size={34}
                sx={tw`text-unocha-primary start-0 top-0 z-10 absolute`}
              />
            )}
          </Box>
        </Tooltip>
      </Box>
      {confirmModal && (
        <Modal
          open={confirmed}
          onClose={() => setConfirmed(!confirmed)}
          sx={tw`flex items-center justify-center`}
        >
          <ModalPaper>
            <p>{confirmModal.text}</p>
            <ButtonDiv>
              <Button
                color="secondary"
                onClick={handleButtonClick}
                text={confirmModal.principalButton}
              />
              {confirmModal.secondaryButton && (
                <Button
                  color="neutral"
                  onClick={() => setConfirmed(false)}
                  text={confirmModal.secondaryButton}
                />
              )}
            </ButtonDiv>
          </ModalPaper>
        </Modal>
      )}
    </>
  );
};

export default AsyncIconButton;
