import React, { useMemo, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import { Close, Check } from '@mui/icons-material';
import tw from 'twin.macro';
import styled from 'styled-components';

import { THEME } from '../../theme';
import { forms } from '@unocha/hpc-data';

const StyledContainer = styled.div(({ color }) => [
  tw`w-full p-3 mr-6 mb-3`,
  `
    background-color: ${color};
    box-sizing: border-box;
    border-radius: 12px;
  `,
]);

interface PropsType {
  info: forms.InputEntryType;
  setValue: () => void;
  rejectValue: () => void;
}

const InputEntry = React.memo(({ info, setValue, rejectValue }: PropsType) => {
  const color = useMemo(() => {
    return info.category === forms.InputEntryCategoriesEnum.ACTIVE_FLOW
      ? THEME.colors.entryBg.active
      : THEME.colors.entryBg.pending;
  }, [info.category]);

  const handleSetValue = useCallback(() => {
    setValue();
  }, [setValue]);

  const handleRejectValue = useCallback(() => {
    rejectValue();
  }, [rejectValue]);

  return (
    <StyledContainer color={color}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <div style={{ color: THEME.colors.primary.normal }}>
          <span style={{ fontWeight: 800 }}>Change: </span>
          <span>
            {info.kind === forms.InputEntryKindsEnum.NEW && 'New Value'}
            {info.kind === forms.InputEntryKindsEnum.REVISED && 'Revised Value'}
            {info.kind === forms.InputEntryKindsEnum.DELETED && 'Blank Value'}
            {info.kind === forms.InputEntryKindsEnum.UNMATCHED &&
              'External Value[Unmatched]'}
          </span>
        </div>
        {info.category === forms.InputEntryCategoriesEnum.ACTIVE_FLOW && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                color: '#357A38',
              }}
            >
              <IconButton
                aria-label="accept"
                sx={{
                  color: THEME.colors.greenLight,
                  '&:hover': {
                    backgroundColor: THEME.colors.greenLight,
                    color: '#fff',
                  },
                  height: 20,
                  width: 20,
                }}
                onClick={handleSetValue}
              >
                <Check sx={{ height: 16, width: 16 }} />
              </IconButton>
              Accept
            </div>
            <div
              style={{
                color: '#FE3A40',
              }}
            >
              <IconButton
                aria-label="reject"
                sx={{
                  color: THEME.colors.secondary.normal,
                  '&:hover': {
                    backgroundColor: THEME.colors.secondary.normal,
                    color: '#fff',
                  },
                  height: 20,
                  width: 20,
                }}
                onClick={handleRejectValue}
              >
                <Close sx={{ height: 16, width: 16 }} />
              </IconButton>
              Reject
            </div>
          </div>
        )}
      </div>
      <div>
        {info.kind === forms.InputEntryKindsEnum.DELETED ? (
          '[Blank]'
        ) : (
          <>
            {typeof info.value === 'string' || typeof info.value === 'number'
              ? info.value
              : Array.isArray(info.value)
              ? info.value
                  .map((value) => {
                    let result = value.displayLabel;
                    if (value.isInferred) {
                      result = result + '(I)';
                    }
                    if (value.isTransferred) {
                      result = result + '(T)';
                    }
                    return result;
                  })
                  .join('\n')
              : info.value?.displayLabel}
          </>
        )}
      </div>
    </StyledContainer>
  );
});

export default InputEntry;
