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
  onDelete: () => Promise<unknown>;
  onDownload: () => Promise<unknown>;
  file?: FormObjectValue;
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
  disabled,
}: UploadFileProps) => {
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {!file ? (
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
            <OverflowSpan>{file.displayLabel}</OverflowSpan>
          </Box>
          <div>
            {!disabled && (
              <>
                <AsyncIconButton
                  fnPromise={onDelete}
                  IconComponent={DeleteIcon}
                />
                <AsyncIconButton
                  fnPromise={async () => {
                    onDelete().then(() => inputFile.current?.click());
                  }}
                  IconComponent={ChangeCircleIcon}
                />
              </>
            )}
            <AsyncIconButton
              fnPromise={onDownload}
              IconComponent={FileDownloadIcon}
            />
          </div>
        </FileViewContainer>
      )}
      <VisuallyHiddenInput
        type="file"
        name={name}
        onChange={(event) => {
          setLoading(true);
          onUpload(event.target.files?.[0]).then(() => setLoading(false));
        }}
        ref={inputFile}
      />
    </div>
  );
};

export default UploadFile;
