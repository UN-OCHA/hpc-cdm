import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  Chip,
} from '@mui/material';
import { indigo } from '@mui/material/colors';
import tw from 'twin.macro';
import axios from 'axios';
import { fileUpload } from '@unocha/hpc-data';
import { log } from 'console';

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

const FileUpload = ({ name, label, fnPromise, onChange }: FileUploadProps) => {
  const [fileDownName, setFileDownName] = useState<string | null>(null);

  const handleFileChange = async (event: any) => {
    if (onChange) {
      const values = onChange(event);
      console.log('%%%', event.target.files[0].name);
      const fileUploadedName: string = event.target.files[0].name;
      console.log('****', fileUploadedName);
      setFileDownName(fileUploadedName);
      console.log('@@@', fileDownName);
    }
    // try {
    //   console.log('asdfasdfasdf');
    //   const setfile: File = event.target.files[0];
    //   console.log(setfile);
    //   const responseData = await fnPromise(setfile);
    //   setUploadedFile(responseData);
    //   console.log(responseData, 'reasdasdff');
    // } catch (error) {
    //   console.log(error, 'error');
    // }
  };

  return (
    <>
      {/* <TextField type="file" />
    <label htmlFor="contained-button-file"> */}
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
      {/* </label> */}
    </>
  );
};

export default FileUpload;
