import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import tw from 'twin.macro';

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

export default function FileUpload() {
  return (
    <StyledFileUpload
      component="label"
      variant="outlined"
      startIcon={<CloudUploadIcon />}
    >
      Upload File
      <VisuallyHiddenInput type="file" />
    </StyledFileUpload>
  );
}
