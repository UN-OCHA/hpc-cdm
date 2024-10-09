import { styled } from '@mui/material/styles';
import tw from 'twin.macro';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { Button, ButtonProps } from '../button';
import { Box } from '@mui/material';
import { useRef, useState } from 'react';
import { FormObjectValue } from '@unocha/hpc-data';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import AsyncIconButton from '../async-icon-button';

type UploadFileProps = {
  name: string;
  buttonConfig: Omit<ButtonProps, 'onClick'>;
  onUpload: (file?: File) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onDownload: () => Promise<unknown>;
  file?: FormObjectValue;
};

/**
 * This styles come from:
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
}: UploadFileProps) => {
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Box>
      {!file ? (
        <Button
          {...buttonConfig}
          onClick={() => {
            inputFile.current?.click();
          }}
          displayLoading={loading}
        ></Button>
      ) : (
        <Box
          sx={tw`flex gap-x-10 justify-around p-4 my-4 border border-solid border-unocha-panel-border rounded-[4px] items-center`}
        >
          <Box sx={tw`flex gap-x-2 items-center overflow-hidden`}>
            <FilePresentIcon color={'primary'} />
            <OverflowSpan>{file.displayLabel}</OverflowSpan>
          </Box>
          <div>
            <AsyncIconButton fnPromise={onDelete} IconComponent={DeleteIcon} />
            <AsyncIconButton
              fnPromise={onDownload}
              IconComponent={FileDownloadIcon}
            />

            <AsyncIconButton
              fnPromise={async () => {
                onDelete().then(() => inputFile.current?.click());
              }}
              IconComponent={ChangeCircleIcon}
            />
          </div>
        </Box>
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
    </Box>
  );
};

export default UploadFile;
