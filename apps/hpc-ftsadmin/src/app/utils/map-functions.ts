import {
  type fileAssetEntities,
  type flows,
  type organizations,
  type util,
} from '@unocha/hpc-data';
import dayjs from 'dayjs';
import { type LanguageKey, t } from '../../i18n';
import { type FlowLinkProps } from '../components/flow-form/flow-link';

export const valueToInteger = (value: string | number) => {
  return typeof value === 'number' ? Math.round(value) : parseInt(value);
};

export const currencyToInteger = (value: string | number) => {
  if (!value) {
    return 0;
  }
  if (typeof value === 'number') {
    return Math.round(value);
  }
  return parseInt(value.replaceAll(',', ''));
};

export const integerToCurrency = (value: number) => {
  return value.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const parseUpdatedCreatedBy = (
  updatedCreatedBy: organizations.UpdatedCreatedBy[],
  lang: LanguageKey
): string => {
  if (updatedCreatedBy.length === 0) {
    return '--';
  }
  const { participantName, date } = updatedCreatedBy.reduce((a, b) => {
    return new Date(a.date) > new Date(b.date) ? a : b;
  });

  return `${participantName} (${dayjs(date).format()})`;
};

export const flowToFlowLinkProps = (
  flow: flows.GetFlowResult | flows.GetFlowsAutocompleteResult[number]
): FlowLinkProps => {
  return {
    id: flow.id,
    versionID: flow.versionID,
    description: flow.description,
    destinationOrganization: flow.organizations.filter(
      (org) => org.flowObject.refDirection === 'destination'
    )[0]?.name,
    destinationLocation: flow.locations.filter(
      (loc) => loc.flowObject.refDirection === 'destination'
    )[0]?.name,
    amountUSD: flow.amountUSD,
    flowDate: dayjs(flow.flowDate),
    projectName: flow.projects.filter(
      (proj) => proj.flowObject.refDirection === 'destination'
    )[0]?.projectVersions[0]?.name,
  };
};

export const flowToFormObjectValue = (
  flow: flows.GetFlowResult | flows.GetFlowsAutocompleteResult[number]
): util.FormObjectValue => {
  return {
    displayLabel: `${flow.id}: ${flow.description}`,
    value: JSON.stringify(flowToFlowLinkProps(flow)),
  };
};
export const flowLinkToFormObjectValue = (
  flowLink: FlowLinkProps
): util.FormObjectValue => {
  return {
    displayLabel: `${flowLink.id}: ${flowLink.description}`,
    value: JSON.stringify(flowLink),
  };
};

export const fileAssetEntityToFileUploadResult = (
  fileAssetEntity?: flows.GetFlowResult['reportDetails'][number]['reportFiles'][number]['fileAssetEntity']
): fileAssetEntities.FileUploadResult | null => {
  if (!fileAssetEntity) {
    return null;
  }
  const self = `/files/fts/${fileAssetEntity.id}`;
  return {
    ...fileAssetEntity,
    name: fileAssetEntity.filename,
    self,
    file: `/public${self}`,
  };
};

export const parseError = (
  error: 'unknown' | 'duplicate' | 'conflict' | undefined,
  component: 'organizationUpdateCreate' | 'keywordTable',
  lang: LanguageKey,
  errorValue?: string
) => {
  if (!error) {
    return;
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
