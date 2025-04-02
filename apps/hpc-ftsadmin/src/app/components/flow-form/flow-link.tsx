import { type categories } from '@unocha/hpc-data';
import { C } from '@unocha/hpc-ui';
import { type Dayjs } from 'dayjs';
import { useFormikContext } from 'formik';
import { MdRemove } from 'react-icons/md';
import { Link } from 'react-router';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import { getContext } from '../../context';
import paths from '../../paths';
import { integerToCurrency, valueToInteger } from '../../utils/map-functions';
import { type FlowFormType } from './flow-form';

export type FlowLinkProps = {
  id: number;
  versionID: number;
  description: string;
  amountUSD: string;
  flowDate: Dayjs | null;
  amountOriginalCurrency: string | null;
  currency: string | null;
  exchangeRate: string | null;
  destinationOrganization?: string;
  destinationLocation?: string;
  projectName?: string;
  earmarking?: categories.Category;
};

const FlowLinkContainer = tw.div`
  flex
  gap-x-8
  justify-between
  items-center
  rounded-sm
  border
  border-solid
  border-unocha-panel-border 
  bg-unocha-panel-bg
  p-4
`;

const FlowLink = ({
  flowLink,
  fieldName,
  disabled,
}: {
  flowLink: FlowLinkProps;
  fieldName: 'parentFlow' | 'childFlows';
  disabled?: boolean;
}) => {
  const { lang } = getContext();
  const { setFieldValue, values } = useFormikContext<FlowFormType>();
  const {
    id,
    versionID,
    description,
    amountUSD,
    amountOriginalCurrency,
    currency,
    destinationOrganization,
    destinationLocation,
    flowDate,
    projectName,
  } = flowLink;

  const SEPARATOR = ' | ';

  const flowDateVerified = flowDate?.isValid() ? flowDate : null;
  const flowLinkDescription = [
    destinationOrganization,
    projectName,
    destinationLocation,
    flowDateVerified?.format('YYYY'),
  ]
    .filter((text) => text !== undefined && text !== null)
    .join(SEPARATOR);

  const flowLinkDate = flowDateVerified ? flowDateVerified.format() : null;

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
    <FlowLinkContainer>
      <Link to={paths.flow(id, versionID)} target="_blank">
        #{id}
      </Link>
      <span>{description}</span>
      <span>{flowLinkDescription}</span>
      <span>{flowLinkDate}</span>
      <span>US${integerToCurrency(valueToInteger(amountUSD))}</span>
      {amountOriginalCurrency && currency && (
        <span>
          {currency}
          {integerToCurrency(valueToInteger(amountOriginalCurrency))}
        </span>
      )}
      {!disabled && (
        <C.Button
          color="secondary"
          text={t.t(lang, (s) => s.components.flowLink.unlink)}
          onClick={() => handleUnlink()}
          startIcon={MdRemove}
        />
      )}
    </FlowLinkContainer>
  );
};

export default FlowLink;
