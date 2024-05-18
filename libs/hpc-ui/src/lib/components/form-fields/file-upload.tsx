import React, { useState, useMemo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import tw from 'twin.macro';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

const StyledFileUpload = tw(Button)`
  mt-[16px]
  mb-[8px]
  p-[3px 14px]
  text-[1.5rem] 
  font-[500]
`;

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

type FileUploadProps = {
  name?: string;
  label: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void | any;
  deleteFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  fnPromise: (index: number) => Promise<void>;
  value?: boolean | string;
  id?: number;
  index: number;
};

const FileUpload = React.memo(
  ({
    onChange,
    value,
    name,
    id,
    deleteFunction,
    fnPromise,
    index,
  }: FileUploadProps) => {
    const [fileDownName, setFileDownName] = useState<string | null>(null);

    const handleDownload = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!id) {
          return;
        }
        fnPromise(index);
      },
      [fnPromise, id, index]
    );

    const handleFileChange = useCallback(
      (event: any) => {
        if (onChange) {
          onChange(event, index);
          const fileUploadedName: string = event.target.files[0].name;
          setFileDownName(fileUploadedName);
        }
      },
      [onChange, index]
    );

    const fileName = useMemo(() => {
      return fileDownName || name;
    }, [fileDownName, name]);

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {!(value && fileName) && (
          <StyledFileUpload
            component="label"
            variant="outlined"
            onChange={handleFileChange}
            startIcon={<CloudUploadIcon />}
          >
            Upload File
            <VisuallyHiddenInput type="file" />
          </StyledFileUpload>
        )}
        {value && fileName && (
          <StyledFileUpload
            component="label"
            variant="outlined"
            onChange={handleFileChange}
            startIcon={<ChangeCircleIcon />}
          >
            Change
            <VisuallyHiddenInput type="file" />
          </StyledFileUpload>
        )}
        {value && fileName && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              border: '1px solid grey',
              width: '80%',
              backgroundColor: 'hsla(0, 50%, 90%, 0.3)',
              alignItems: 'center',
              borderRadius: '5px',
              marginTop: '6px',
            }}
          >
            <Button
              style={{
                marginLeft: '5px',
                textDecoration: 'underline',
              }}
              onClick={handleDownload}
              startIcon={<FileDownloadIcon />}
            >
              {fileName}
            </Button>
            <IconButton
              aria-label="delete"
              size="small"
              onClick={deleteFunction}
              color="primary"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      </div>
    );
  }
);

export default FileUpload;
