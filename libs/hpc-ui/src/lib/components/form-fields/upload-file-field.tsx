import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { type util } from '@unocha/hpc-data';
import { useRef, useState } from 'react';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../i18n';
import AsyncIconButton from '../async-icon-button';
import { Button, type ButtonProps } from '../button';

type UploadFileProps = {
  name: string;
  buttonConfig: Omit<ButtonProps, 'onClick'>;
  onUpload: (file?: File) => Promise<unknown>;
  onDelete?: (
    setSavedFile: React.Dispatch<React.SetStateAction<File | undefined>>
  ) => Promise<unknown>;
  onDownload?: {
    handleDownload: () => Promise<unknown>;
    handleErrorToast?: (error: Error) => void;
  };
  file?: util.FormObjectValue;
  confirmUpload?: {
    validation: (file?: File, ...args: unknown[]) => unknown;
    onSuccess: (fileName: string) => unknown;
    onError: (err: unknown) => unknown;
  };
  disabled?: boolean;
  lang?: LanguageKey;
  hideFileChangeStatusStyle?: boolean;
};

/**
 * These styles come from:
 * https://mui.com/material-ui/react-button/#file-upload
 */
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FileViewContainer = tw.div`
  flex
  gap-x-10
  justify-around
  items-center
  p-4
  my-4
  border
  border-solid
  border-unocha-panel-border
  rounded-sm
`;

const ButtonsContainer = tw.div`
  flex
  flex-col
  items-center
`;

const OverflowSpan = tw.span`
  break-all
  overflow-hidden
`;

const UploadFile = ({
  name,
  buttonConfig,
  onUpload,
  onDelete,
  onDownload,
  file,
  confirmUpload,
  disabled,
  lang = 'en',
  hideFileChangeStatusStyle,
}: UploadFileProps) => {
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedFile, setSavedFile] = useState<File>();
  const [isChanged, setIsChanged] = useState(false);

  const fileName = file ? file.displayLabel : savedFile ? savedFile.name : '';
  const hasNoFile = !file && !savedFile;

  const resetFileField = () => {
    if (inputFile.current?.value) {
      inputFile.current.value = '';
    }
  };
  const handleUpload = async () => {
    if (!confirmUpload) {
      return;
    }
    const { onError, onSuccess } = confirmUpload;
    setIsLoading(true);
    try {
      await onUpload(savedFile);
      onSuccess(fileName);
      setSavedFile(undefined);
      resetFileField();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      onError(error);
    }
  };

  return (
    <div>
      {hasNoFile ? (
        !disabled && (
          <Button
            {...buttonConfig}
            onClick={() => {
              inputFile.current?.click();
            }}
            shouldDisplayLoading={isLoading}
          />
        )
      ) : (
        <FileViewContainer>
          <Box sx={tw`flex gap-x-2 items-center overflow-hidden`}>
            <FilePresentIcon color="primary" />
            <OverflowSpan>{fileName}</OverflowSpan>
          </Box>
          <ButtonsContainer>
            {!disabled && (
              <>
                {confirmUpload && (
                  <Button
                    color="primary"
                    onClick={handleUpload}
                    text={t.t(lang, (s) => s.uploadFileField.upload)}
                  />
                )}
                {onDelete && (
                  <>
                    <AsyncIconButton
                      fnPromise={async () => {
                        await onDelete(setSavedFile);
                        resetFileField();
                      }}
                      IconComponent={DeleteIcon}
                      tooltipText={t.t(lang, (s) => s.uploadFileField.delete)}
                      tooltipPlacement="right"
                    />
                    <AsyncIconButton
                      fnPromise={() => {
                        if (confirmUpload) {
                          inputFile.current?.click();
                          return Promise.resolve(undefined);
                        }
                        setIsChanged(true);
                        inputFile.current?.click();
                        return Promise.resolve(undefined);
                      }}
                      IconComponent={ChangeCircleIcon}
                      tooltipText={t.t(lang, (s) => s.uploadFileField.change)}
                      tooltipPlacement="right"
                      hideStatusStyle={hideFileChangeStatusStyle}
                    />
                  </>
                )}
              </>
            )}
            {onDownload && (
              <AsyncIconButton
                fnPromise={onDownload.handleDownload}
                handlerErrorToast={onDownload.handleErrorToast}
                IconComponent={FileDownloadIcon}
                tooltipText={t.t(lang, (s) => s.uploadFileField.download)}
                tooltipPlacement="right"
              />
            )}
          </ButtonsContainer>
        </FileViewContainer>
      )}
      <VisuallyHiddenInput
        type="file"
        name={name}
        onChange={async (event) => {
          const newFile = event.target.files?.[0];
          if (!newFile) {
            return;
          }
          if (confirmUpload) {
            const { validation } = confirmUpload;
            if (!validation(newFile)) {
              return;
            }
            setSavedFile(newFile);
            return;
          }
          setIsLoading(true);
          if (onDelete && isChanged) {
            await onDelete(setSavedFile);
          }
          await onUpload(newFile);
          setIsLoading(false);
        }}
        ref={inputFile}
      />
    </div>
  );
};

export default UploadFile;
