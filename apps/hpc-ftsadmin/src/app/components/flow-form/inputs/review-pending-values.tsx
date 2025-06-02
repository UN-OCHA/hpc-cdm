import { Box, Chip, Paper, Tooltip } from '@mui/material';
import { type FormObjectValue } from '@unocha/hpc-data';
import { C, THEME } from '@unocha/hpc-ui';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import WarningIcon from '@mui/icons-material/Warning';
import { t } from '../../../../i18n';
import { getContext } from '../../../context';
import { useFormikContext } from 'formik';
import type { FlowFormType } from '../flow-form';
import type { Dayjs } from 'dayjs';
import dayjs from '../../../../libs/dayjs';

type InputFieldsTypes =
  | 'MultiAutocomplete'
  | 'Autocomplete'
  | 'Date'
  | 'Radio'
  | 'Text';
export type ReviewPendingValuesProps = {
  fieldName:
    | keyof FlowFormType
    | keyof FlowFormType['reportingDetails'][number];
  componentType: InputFieldsTypes;
  setPendingValuesHandled: React.Dispatch<React.SetStateAction<number>>;
  pendingValues?: Dayjs | string | FormObjectValue | FormObjectValue[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (...args: any[]) => unknown;
  shouldAcceptChange?: boolean;
};

const BluePaper = tw(Paper)`
  bg-unocha-primary
  p-4
  mb-4
`;
const ChipContainer = tw.div`
  my-4
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
  pendingValues !== undefined &&
  !Array.isArray(pendingValues) &&
  typeof pendingValues !== 'string' &&
  'value' in pendingValues;

const isString = (
  pendingValues: ReviewPendingValuesProps['pendingValues']
): pendingValues is string =>
  !Array.isArray(pendingValues) &&
  typeof pendingValues === 'string' &&
  pendingValues !== '';

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
  componentType,
  pendingValues,
  setPendingValuesHandled,
  onClick,
  shouldAcceptChange,
}: ReviewPendingValuesProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const lang = getContext().lang;
  const { setFieldValue } = useFormikContext();

  const MAP_COMPONENT_TYPE_TO_IS_TYPE: Record<InputFieldsTypes, boolean> = {
    MultiAutocomplete:
      isFormObjectValueArray(pendingValues) || isBlank(pendingValues),
    Autocomplete: isFormObjectValue(pendingValues) || isBlank(pendingValues),
    Date: dayjs.isDayjs(pendingValues) || isBlank(pendingValues),
    Radio: isString(pendingValues),
    Text: isString(pendingValues) || isBlank(pendingValues),
  };
  const isUnmatched = !MAP_COMPONENT_TYPE_TO_IS_TYPE[componentType];

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setPendingValuesHandled((count) => count + 1);
    setIsVisible(false);
  };
  const handleAccept = () => {
    if (!isUnmatched) {
      setFieldValue(fieldName, pendingValues);
      handleClick();
    }
  };

  useEffect(() => {
    if (!shouldAcceptChange) {
      return;
    }
    if (isUnmatched && pendingValues !== undefined) {
      handleClick();
      return;
    }
    handleAccept();
  }, [shouldAcceptChange]);

  if (!isVisible || pendingValues === undefined) {
    return;
  }

  return (
    <BluePaper elevation={3}>
      <Box sx={tw`flex justify-between`}>
        <HeaderContainer>
          <WarningIcon color="warning" />
          <span style={{ color: '#fff' }}>
            {t.t(lang, (s) => s.components.reviewPendingValues.label)}
          </span>
        </HeaderContainer>
        {!isUnmatched ? (
          <Box sx={tw`flex gap-x-4`}>
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
        ) : (
          <Box sx={tw`flex`}>
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
      </Box>

      <ChipContainer>
        {isFormObjectValueArray(pendingValues) &&
          pendingValues.map((pendingValue) => (
            <React.Fragment key={pendingValue.value}>
              <RenderPendingValue label={pendingValue.displayLabel} />
            </React.Fragment>
          ))}

        {isString(pendingValues) && (
          <RenderPendingValue label={pendingValues} />
        )}

        {isFormObjectValue(pendingValues) && (
          <RenderPendingValue label={pendingValues.displayLabel} />
        )}

        {dayjs.isDayjs(pendingValues) && (
          <RenderPendingValue label={pendingValues.format()} />
        )}
        {isUnmatched && (
          <span
            style={{
              color: THEME.colors.secondary.light,
              display: 'block',
              textAlign: 'start',
            }}
          >
            {t.t(lang, (s) => s.components.reviewPendingValues.unmatched)}
          </span>
        )}
        {isBlank(pendingValues) && <p style={{ color: '#fff' }}>[blank]</p>}
      </ChipContainer>
    </BluePaper>
  );
};

export default ReviewPendingValues;
