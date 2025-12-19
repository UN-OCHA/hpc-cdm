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
  dataTest?: Partial<Record<Field, string>>;
};

const Label = tw.label`
  font-semibold
`;
const Blank = tw.span`
  bg-unocha-warning
  px-2
  rounded-sm
`;

const FormChip = ({ text, dataTest }: { text: string; dataTest?: string }) => {
  return (
    <Tooltip title={text}>
      <Chip
        sx={{
          m: 0.5,
          position: 'relative',
        }}
        label={
          <EllipsisText maxWidth={400} dataTest={dataTest}>
            {text}
          </EllipsisText>
        }
        size="small"
        color="primary"
      />
    </Tooltip>
  );
};

const FormGroupReadOnly = ({
  fields,
  values,
  dataTest,
}: FormGroupReadOnlyProps) => {
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
              {fieldValue.length === 0 ? (
                <Blank>blank</Blank>
              ) : (
                fieldValue.map(({ value, displayLabel }) => (
                  <div key={value}>
                    <FormChip
                      text={displayLabel}
                      dataTest={dataTest?.[fieldName]}
                    />
                  </div>
                ))
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default FormGroupReadOnly;
