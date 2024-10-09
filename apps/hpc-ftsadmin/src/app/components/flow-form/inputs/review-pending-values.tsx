import { Box, Chip, Paper, Tooltip } from '@mui/material';
import { FormObjectValue } from '@unocha/hpc-data';
import { C, THEME } from '@unocha/hpc-ui';
import { useState } from 'react';
import tw from 'twin.macro';
import WarningIcon from '@mui/icons-material/Warning';
import { t } from '../../../../i18n';
import { getContext } from '../../../context';
import { useFormikContext } from 'formik';
import type { FlowFormType } from '../flow-form';

export type ReviewPendingValuesProps = {
  fieldName:
    | keyof FlowFormType
    | keyof FlowFormType['reportingDetails'][number];
  pendingValues?: string | FormObjectValue | FormObjectValue[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (...args: any[]) => unknown;
};

const BluePaper = tw(Paper)`
  bg-unocha-primary
  p-6
`;
const ChipContainer = tw.div`
  my-6
`;
const HeaderContainer = tw.div`
  flex
  gap-4
  align-middle
`;

const isFormObjectValueArray = (
  pendingValues: ReviewPendingValuesProps['pendingValues']
): pendingValues is FormObjectValue[] =>
  Array.isArray(pendingValues) && pendingValues.length > 0;

const isFormObjectValue = (
  pendingValues: ReviewPendingValuesProps['pendingValues']
): pendingValues is FormObjectValue =>
  pendingValues !== null &&
  !Array.isArray(pendingValues) &&
  typeof pendingValues !== 'string';

const isString = (
  pendingValues: ReviewPendingValuesProps['pendingValues']
): pendingValues is string =>
  !Array.isArray(pendingValues) && typeof pendingValues === 'string';

const isBlank = (pendingValues: ReviewPendingValuesProps['pendingValues']) =>
  (Array.isArray(pendingValues) && pendingValues.length === 0) ||
  (isString(pendingValues) && pendingValues === '') ||
  pendingValues === null;

const RenderPendingValue = ({ label }: { label: string }) => (
  <Tooltip title={label}>
    <Chip sx={tw`m-1`} label={label} color="warning" />
  </Tooltip>
);

const ReviewPendingValues = ({
  fieldName,
  pendingValues,
  onClick,
}: ReviewPendingValuesProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const lang = getContext().lang;
  const { setFieldValue } = useFormikContext();
  if (!isVisible || pendingValues === undefined) {
    return;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setIsVisible(false);
  };
  const handleAccept = () => {
    if (!isString(pendingValues)) {
      setFieldValue(fieldName, pendingValues);
      handleClick();
    }
  };

  return (
    <BluePaper elevation={3}>
      <HeaderContainer>
        <WarningIcon color="warning" />
        <span style={{ color: '#fff' }}>
          {t.t(lang, (s) => s.components.reviewPendingValues.label)}
        </span>
      </HeaderContainer>
      <ChipContainer>
        {isFormObjectValueArray(pendingValues) &&
          pendingValues.map((pendingValue) => (
            <RenderPendingValue label={pendingValue.displayLabel} />
          ))}

        {isString(pendingValues) && (
          <>
            <RenderPendingValue label={pendingValues} />
            <span
              style={{
                color: THEME.colors.secondary.light,
                display: 'block',
                textAlign: 'start',
              }}
            >
              {t.t(lang, (s) => s.components.reviewPendingValues.unmatched)}
            </span>
          </>
        )}

        {isFormObjectValue(pendingValues) && (
          <RenderPendingValue label={pendingValues.displayLabel} />
        )}

        {isBlank(pendingValues) && <p style={{ color: '#fff' }}>[blank]</p>}
      </ChipContainer>
      {!isString(pendingValues) && (
        <Box sx={tw`flex gap-x-4 justify-end`}>
          <C.Button
            text={t.t(
              lang,
              (s) => s.components.reviewPendingValues.button.accept
            )}
            onClick={handleAccept}
            color="primary_light"
          />
          <C.Button
            text={t.t(
              lang,
              (s) => s.components.reviewPendingValues.button.reject
            )}
            onClick={handleClick}
            color="secondary_light"
          />
        </Box>
      )}
      {isString(pendingValues) && (
        <Box sx={tw`flex justify-end`}>
          <C.Button
            text={t.t(
              lang,
              (s) => s.components.reviewPendingValues.button.confirm
            )}
            onClick={handleClick}
            color="neutral_light"
          />
        </Box>
      )}
    </BluePaper>
  );
};

export default ReviewPendingValues;
