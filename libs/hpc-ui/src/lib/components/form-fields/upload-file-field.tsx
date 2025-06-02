import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { type FormObjectValue } from '@unocha/hpc-data';
import { useRef, useState } from 'react';
import tw from 'twin.macro';
import AsyncIconButton from '../async-icon-button';
import { Button, type ButtonProps } from '../button';

type UploadFileProps = {
  name: string;
  buttonConfig: Omit<ButtonProps, 'onClick'>;
  onUpload: (file?: File) => Promise<unknown>;
  onDelete?: (
    setSavedFile: React.Dispatch<React.SetStateAction<File | undefined>>
  ) => Promise<unknown>;
  onDownload?: () => Promise<unknown>;
  file?: FormObjectValue;
  confirmUpload?: {
    validation: (file?: File, ...args: unknown[]) => unknown;
    onSuccess: (fileName: string | null) => unknown;
    onError: (err: unknown) => unknown;
  };
  disabled?: boolean;
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
}: UploadFileProps) => {
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedFile, setSavedFile] = useState<File>();

  const fileName = file ? file.displayLabel : savedFile ? savedFile.name : null;

  const resetFileField = () => {
    if (inputFile.current?.value) {
      inputFile.current.value = '';
    }
  };
  return (
    <div>
      {!file && !savedFile ? (
        !disabled && (
          <Button
            {...buttonConfig}
            onClick={() => {
              inputFile.current?.click();
            }}
            displayLoading={loading}
          />
        )
      ) : (
        <FileViewContainer>
          <Box sx={tw`flex gap-x-2 items-center overflow-hidden`}>
            <FilePresentIcon color={'primary'} />
            <OverflowSpan>{fileName}</OverflowSpan>
          </Box>
          <ButtonsContainer>
            {!disabled && (
              <>
                {confirmUpload && (
                  <Button
                    color="primary"
                    onClick={async () => {
                      const { onError, onSuccess } = confirmUpload;
                      setLoading(true);
                      try {
                        await onUpload(savedFile);
                        onSuccess(fileName);
                        setSavedFile(undefined);
                        resetFileField();
                      } catch (error) {
                        onError(error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    text="Upload"
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
                    />
                    <AsyncIconButton
                      fnPromise={async () => {
                        if (confirmUpload) {
                          inputFile.current?.click();
                          return;
                        }
                        onDelete(setSavedFile).then(
                          () => inputFile.current?.click()
                        );
                      }}
                      IconComponent={ChangeCircleIcon}
                    />
                  </>
                )}
              </>
            )}
            {onDownload && (
              <AsyncIconButton
                fnPromise={onDownload}
                IconComponent={FileDownloadIcon}
              />
            )}
          </ButtonsContainer>
        </FileViewContainer>
      )}
      <VisuallyHiddenInput
        type="file"
        name={name}
        onChange={(event) => {
          const newFile = event.target.files?.[0];
          if (confirmUpload) {
            const { validation } = confirmUpload;
            if (!validation(newFile)) {
              return;
            }
            setSavedFile(newFile);
            return;
          }
          setLoading(true);
          onUpload(newFile).then(() => setLoading(false));
        }}
        ref={inputFile}
      />
    </div>
  );
};

export default UploadFile;
