import type { FormObjectValue } from '@unocha/hpc-data';
import type { FlowFormType } from './flow-form';

import { Box, Chip, Tooltip } from '@mui/material';
import tw from 'twin.macro';

import { t } from '../../../i18n';
import { getContext } from '../../context';
import EllipsisText from '../ellipsis-text';

type Field = keyof Pick<
  FlowFormType,
  | 'fundingSourceOrganizations'
  | 'fundingSourceUsageYears'
  | 'fundingSourceLocations'
  | 'fundingSourceEmergencies'
  | 'fundingSourceGlobalClusters'
  | 'fundingSourceFieldClusters'
  | 'fundingSourceProject'
  | 'fundingSourcePlan'
>;

type FormGroupReadOnlyProps = {
  fields: readonly Field[];
  values: FlowFormType;
};

const Label = tw.label`
  font-semibold
`;
const Blank = tw.span`
  bg-unocha-warning
  px-2
  rounded-sm
`;

const isEmpty = (
  value: FormObjectValue | FormObjectValue[] | null
): value is FormObjectValue[] | null => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return !value;
};
const isArrayWithContent = (
  value: FormObjectValue | FormObjectValue[] | null
): value is FormObjectValue[] => {
  return Array.isArray(value) && value.length > 0;
};

const FormChip = ({ text }: { text: string }) => {
  return (
    <Tooltip title={text}>
      <Chip
        sx={{
          m: 0.5,
          position: 'relative',
        }}
        label={<EllipsisText maxWidth={400}>{text}</EllipsisText>}
        size="small"
        color="primary"
      />
    </Tooltip>
  );
};

const FormGroupReadOnly = ({ fields, values }: FormGroupReadOnlyProps) => {
  const { lang } = getContext();
  return (
    <Box sx={tw`flex flex-col gap-y-10 mt-6`}>
      {fields.map((fieldName) => {
        const fieldValue = values[fieldName];
        return (
          <Box key={fieldName} sx={tw`flex gap-x-2`}>
            <Label>
              {t.t(lang, (s) => s.components.flowForm.fields[fieldName])}:
            </Label>
            <Box sx={tw`flex flex-wrap`}>
              {isEmpty(fieldValue) ? (
                <Blank>blank</Blank>
              ) : isArrayWithContent(fieldValue) ? (
                fieldValue.map(({ value, displayLabel }) => (
                  <div key={value}>
                    <FormChip text={displayLabel} />
                  </div>
                ))
              ) : (
                fieldValue.displayLabel
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default FormGroupReadOnly;
