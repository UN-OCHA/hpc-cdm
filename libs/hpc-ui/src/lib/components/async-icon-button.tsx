import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { IconButton, Modal, type SvgIconProps, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import * as React from 'react';
import { useNavigate } from 'react-router';
import tw from 'twin.macro';
import { Button } from './button';

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
  reloadAfterSuccess?: boolean;
}

const ModalPaper = tw.div`
  p-8
  my-1
  items-center
  bg-white
  max-w-3xl
  rounded-md
  shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]
`;

const ButtonDiv = tw.div`
  flex
  gap-x-4
  my-4
  justify-end
`;

const AsyncIconButton = ({
  IconComponent,
  fnPromise,
  disabledText,
  tooltipText,
  confirmModal,
  iconSx,
  redirectAfterFetch,
  reloadAfterSuccess,
}: AsyncIconButtonProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isConfirmed, setConfirmed] = React.useState(false);
  const navigate = useNavigate();
  const isDisabled = disabledText !== undefined;
  const buttonSx = {
    ...(isSuccess && tw`disabled:bg-unocha-success-light`),
    ...(hasError && tw`disabled:bg-unocha-error-light`),
    ...(isDisabled && tw`disabled:bg-opacity-40`),
  };

  React.useEffect(() => {
    if (isSuccess || hasError) {
      setTimeout(() => {
        setIsSuccess(false);
        setHasError(false);
      }, 1500);
    }
  }, [isSuccess, hasError]);
  const handleButtonClick = async () => {
    if (!isLoading) {
      setIsSuccess(false);
      setHasError(false);
      setIsLoading(true);
      setConfirmed(false);
      try {
        await fnPromise();
        setIsSuccess(true);
        setIsLoading(false);
        if (redirectAfterFetch) {
          navigate(redirectAfterFetch);
        }
        if (reloadAfterSuccess) {
          globalThis.location.reload();
        }
      } catch (error) {
        console.error(error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={disabledText ?? tooltipText}>
          <Box sx={{ m: 1, position: 'relative' }}>
            <IconButton
              disabled={isSuccess || hasError || isDisabled}
              size="small"
              sx={buttonSx}
              onClick={
                confirmModal ? () => setConfirmed(true) : handleButtonClick
              }
            >
              {isSuccess ? (
                <CheckIcon sx={iconSx} />
              ) : hasError ? (
                <ErrorOutlineIcon sx={iconSx} />
              ) : (
                <IconComponent sx={iconSx} />
              )}
            </IconButton>

            {isLoading && (
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
          open={isConfirmed}
          onClose={() => setConfirmed(!isConfirmed)}
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
