import { FormObjectValue, flows, organizations } from '@unocha/hpc-data';
import { LanguageKey, t } from '../../i18n';
import dayjs from 'dayjs';
import { FlowLinkProps } from '../components/flow-link';

export const valueToInteger = (value: string | number) => {
  return typeof value === 'number' ? value : parseInt(value);
};

export const currencyToInteger = (value: string) => {
  return parseInt(value.replace(/,/g, ''));
};

export const integerToCurrency = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const parseUpdatedCreatedBy = (
  updatedCreatedBy: Array<organizations.UpdatedCreatedBy>,
  lang: LanguageKey
): string => {
  if (updatedCreatedBy.length === 0) {
    return '--';
  }
  const { participantName, date } = updatedCreatedBy.reduce((a, b) => {
    return new Date(a.date) > new Date(b.date) ? a : b;
  });

  return `${participantName} (${dayjs(date).locale(lang).format('D/M/YYYY')})`;
};

export const flowToFlowLinkProps = (
  flow: flows.GetFlowResult | flows.GetFlowsAutocompleteResult[number]
): FlowLinkProps => {
  return {
    id: flow.id,
    description: flow.description,
    destinationOrganization: flow.organizations.filter(
      (org) => org.flowObject.refDirection === 'destination'
    )[0]?.name,
    destinationLocation: flow.locations.filter(
      (loc) => loc.flowObject.refDirection === 'destination'
    )[0]?.name,
    amountUSD: flow.amountUSD,
    flowDate: new Date(flow.flowDate),
    projectName: flow.projects.filter(
      (proj) => proj.flowObject.refDirection === 'destination'
    )[0]?.projectVersions[0]?.name,
  };
};

export const flowToFormObjectValue = (
  flow: flows.GetFlowResult | flows.GetFlowsAutocompleteResult[number]
): FormObjectValue => {
  return {
    displayLabel: `${flow.id}: ${flow.description}`,
    value: JSON.stringify(flowToFlowLinkProps(flow)),
  };
};
export const flowLinkToFormObjectValue = (
  flowLink: FlowLinkProps
): FormObjectValue => {
  return {
    displayLabel: `${flowLink.id}: ${flowLink.description}`,
    value: JSON.stringify(flowLink),
  };
};

export const parseError = (
  error: 'unknown' | 'duplicate' | 'conflict' | undefined,
  component: 'organizationUpdateCreate' | 'keywordTable',
  lang: LanguageKey,
  errorValue?: string
) => {
  if (!error) {
    return undefined;
  }
  const translatedError = t.t(lang, (s) => {
    if (component === 'keywordTable' && error !== 'conflict') {
      return s.components[component].errors[error];
    } else if (component === 'organizationUpdateCreate') {
      return s.components[component].errors[error];
    }
    return s.components[component].errors.unknown;
  });
  
  if (error === 'duplicate' && errorValue) {
    return translatedError.replace(
      `${
        component === 'keywordTable' ? '{keywordName}' : '{organizationName}'
      }`,
      errorValue
    );
  }

  return translatedError;
};
