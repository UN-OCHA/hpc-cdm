import {
  type fileAssetEntities,
  type flows,
  type organizations,
  util,
} from '@unocha/hpc-data';
import { isRight } from 'fp-ts/lib/Either';
import dayjs from '../../libs/dayjs';
import { type FlowLinkProps } from '../components/flow-form/flow-link';

export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const mergeArraysByUniqueProperty = <
  T extends Record<K, unknown>,
  K extends keyof T,
>(
  property: K,
  ...arrays: T[][]
): T[] => {
  const map = new Map<T[K], T>();

  for (const array of arrays) {
    for (const obj of array) {
      const value = obj[property] as T[K];
      if (!map.has(value)) {
        map.set(value, obj);
      }
    }
  }
  return [...map.values()];
};

export const valueToInteger = (value: string | number) => {
  const decodedValue = util.INTEGER_FROM_STRING.decode(value);
  if (isRight(decodedValue)) {
    return decodedValue.right;
  }
  return typeof value === 'number' ? Math.round(value) : parseInt(value);
};

export const valueToFloat = (value: string | number) => {
  const decodedValue = util.NUMBER_FROM_STRING.decode(value);
  if (isRight(decodedValue)) {
    return decodedValue.right;
  }
  return typeof value === 'number' ? value : parseFloat(value);
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
  updatedCreatedBy: organizations.UpdatedCreatedBy[]
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
    description: flow.description ?? '',
    destinationOrganization: flow.organizations.find(
      (org) => org.flowObject.refDirection === 'destination'
    )?.name,
    destinationLocation: flow.locations.find(
      (loc) => loc.flowObject.refDirection === 'destination'
    )?.name,
    amountUSD: flow.amountUSD.toString(),
    amountOriginalCurrency: flow.origAmount ? flow.origAmount.toString() : null,
    currency: flow.origCurrency,
    exchangeRate: flow.exchangeRate ? flow.exchangeRate.toString() : null,
    flowDate: dayjs(flow.flowDate),
    projectName: flow.projects
      .find((proj) => proj.flowObject.refDirection === 'destination')
      ?.projectVersions.at(0)?.name,
    earmarking: flow.categories.find((cat) => cat.group === 'earmarkingType'),
    restricted: flow.restricted,
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
