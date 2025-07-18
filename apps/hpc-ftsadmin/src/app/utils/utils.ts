import {
  type fileAssetEntities,
  type flows,
  type organizations,
  util,
} from '@unocha/hpc-data';
import { isRight } from 'fp-ts/lib/Either';
import dayjs from '../../libs/dayjs';
import { type FlowLinkProps } from '../components/flow-form/flow-link';
import { DEFAULT_LOCALE_INTL, EMPTY_CELL } from './constants';

/**
 * Validate URL with strict hostname requirements:
 * - Only HTTP/HTTPS protocols
 * - No explicit port numbers
 * - Hostname must have at least one dot (TLD required)
 * - Each hostname part must be 63 characters or less (hostname limit)
 * - Each hostname part contains only ASCII letters, numbers, and hyphens
 * - Each hostname part cannot start or end with a hyphen
 * - TLD must be at least 2 characters and contain only ASCII letters
 * - TLD cannot be numeric
 * - No Punicode/internationalized domain names
 * - No whitespace in any part
 */
export const isValidUrl = (urlString: string): boolean => {
  // Reject URLs that contain Punicode in the original string
  if (urlString.includes('xn--')) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }

  const { hostname, host, protocol } = url;

  // Reject URLs where hostname contains Punicode (catches Unicode chars that got converted)
  if (hostname.includes('xn--')) {
    return false;
  }

  // Only allow HTTP/HTTPS protocols
  if (protocol !== 'http:' && protocol !== 'https:') {
    return false;
  }

  // Reject URLs with explicit port numbers
  if (host !== hostname) {
    return false;
  }

  // Split hostname into parts
  const parts = hostname.split('.');
  const tld = parts.at(-1);

  // Require TLD - disallow hostnames without at least one dot
  if (parts.length < 2) {
    return false;
  }

  // Cannot ever be true at this point, after above condition is passed, but needed just for TS
  if (!tld) {
    return false;
  }

  // Reject numeric TLDs
  if (/^\d+$/.test(tld)) {
    return false;
  }

  // TLD must be at least 2 characters and contain only ASCII letters
  if (!/^[a-z]{2,}$/i.test(tld)) {
    return false;
  }

  // Disallow spaces in TLD
  if (/\s/.test(tld)) {
    return false;
  }

  // Check each part of the hostname
  return parts.every((part) => {
    // Reject parts longer than 63 characters
    if (part.length > 63) {
      return false;
    }

    // Only allow ASCII letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/i.test(part)) {
      return false;
    }

    // Disallow parts starting or ending with hyphen
    if (/^-|-$/.test(part)) {
      return false;
    }

    return true;
  });
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
  return Intl.NumberFormat(DEFAULT_LOCALE_INTL, {
    maximumFractionDigits: 0,
  }).format(value);
};

export const parseUpdatedCreatedBy = (
  updatedCreatedBy: organizations.UpdatedCreatedBy[]
): string => {
  if (updatedCreatedBy.length === 0) {
    return EMPTY_CELL;
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
