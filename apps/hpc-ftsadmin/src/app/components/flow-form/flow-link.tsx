import { Box } from '@mui/material';
import * as paths from '../../paths';
import { Link } from 'react-router';
import tw from 'twin.macro';
import { Dayjs } from 'dayjs';
import { integerToCurrency, valueToInteger } from '../../utils/map-functions';
import { C } from '@unocha/hpc-ui';
import { FlowFormType } from './flow-form';
import { useFormikContext } from 'formik';
import { MdRemove } from 'react-icons/md';
import { t } from '../../../i18n';
import { getContext } from '../../context';
import { categories } from '@unocha/hpc-data';

export type FlowLinkProps = {
  id: number;
  versionID: number;
  description: string;
  destinationOrganization: string;
  destinationLocation: string;
  amountUSD: string;
  flowDate: Dayjs | null;
  projectName: string;
  earmarking?: categories.Category;
};

const FlowLink = ({
  flowLink,
  fieldName,
}: {
  flowLink: FlowLinkProps;
  fieldName: 'parentFlow' | 'childFlows';
}) => {
  const { lang } = getContext();
  const { setFieldValue, values } = useFormikContext<FlowFormType>();
  const {
    id,
    versionID,
    description,
    destinationOrganization,
    destinationLocation,
    amountUSD,
    flowDate,
    projectName,
  } = flowLink;

  const SEPARATOR = ' | ';
  const handleUnlink = () => {
    const value = values[fieldName];
    if (!value || !Array.isArray(value)) {
      setFieldValue(fieldName, null);
    } else {
      setFieldValue(
        fieldName,
        value.filter((flow) => flow.id !== id)
      );
    }
  };
  return (
    <Box
      sx={tw`flex gap-x-8 bg-unocha-panel-bg rounded-[4px] border border-solid border-unocha-panel-border p-4 items-center justify-between`}
    >
      <Link to={paths.flow(id, versionID)} target="_blank">
        #{id}
      </Link>
      <span>{description}</span>
      <span>
        {`${
          destinationOrganization ? destinationOrganization + SEPARATOR : ''
        }${projectName ? projectName + SEPARATOR : ''}${
          destinationLocation ? destinationLocation + SEPARATOR : ''
        }${flowDate?.format('YYYY')}`}
      </span>
      <span>{flowDate?.format()}</span>
      <span>US${integerToCurrency(valueToInteger(amountUSD))}</span>
      <C.Button
        color="secondary"
        text={t.t(lang, (s) => s.components.flowLink.unlink)}
        onClick={() => handleUnlink()}
        startIcon={MdRemove}
      />
    </Box>
  );
};

export default FlowLink;
