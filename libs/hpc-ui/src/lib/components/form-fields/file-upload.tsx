import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import tw from 'twin.macro';
import { fileUpload } from '@unocha/hpc-data';

const StyledFileUpload = tw(Button)`
mt-[16px]
mb-[8px]
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
  name: string;
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | any;
  fnPromise?: (file: File) => Promise<fileUpload.FileUploadResult>;
};

const FileUpload = ({ onChange }: FileUploadProps) => {
  const [fileDownName, setFileDownName] = useState<string | null>(null);

  const handleFileChange = async (event: any) => {
    if (onChange) {
      const values = onChange(event);
      const fileUploadedName: string = event.target.files[0].name;
      setFileDownName(fileUploadedName);
    }
  };

  return (
    <>
      <StyledFileUpload
        component="label"
        variant="outlined"
        onChange={handleFileChange}
        startIcon={<CloudUploadIcon />}
      >
        Upload File
        <VisuallyHiddenInput type="file" />
      </StyledFileUpload>
      <Button color="primary">{fileDownName}</Button>
    </>
  );
};

export default FileUpload;
