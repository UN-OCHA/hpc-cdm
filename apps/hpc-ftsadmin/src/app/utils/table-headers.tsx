import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { Query } from '../components/flows-table';

export type HeaderID =
  | 'flow.id'
  | 'flow.versionID'
  | 'flow.updatedAt'
  | 'externalReference.systemID'
  | 'flow.amountUSD'
  | 'source.organization.name'
  | 'destination.organization.name'
  | 'destination.planVersion.name'
  | 'destination.location.name'
  | 'destination.usageYear.year'
  | 'details';

export interface TableHeadersProps {
  id: number;
  identifierID: HeaderID;
  sortable?: boolean;
  label: keyof Strings['components']['flowsTable']['headers'];
}
export const POSSIBLE_HEADER_VALUES: Record<
  number,
  {
    id: number;
    identifierID: HeaderID;
    sortable?: boolean;
    label: keyof Strings['components']['flowsTable']['headers'];
  }
> = {
  1: {
    id: 1,
    identifierID: 'flow.id',
    sortable: true,
    label: 'id',
  },
  2: {
    id: 2,
    identifierID: 'flow.updatedAt',
    sortable: true,
    label: 'updatedCreated',
  },
  3: {
    id: 3,
    identifierID: 'externalReference.systemID',
    sortable: true,
    label: 'dataProvider',
  },
  4: {
    id: 4,
    identifierID: 'flow.amountUSD',
    sortable: true,
    label: 'amountUSD',
  },
  5: {
    id: 5,
    identifierID: 'source.organization.name',
    sortable: true,
    label: 'sourceOrganization',
  },
  6: {
    id: 6,
    identifierID: 'destination.organization.name',
    sortable: true,
    label: 'destinationOrganization',
  },
  7: {
    id: 7,
    identifierID: 'destination.planVersion.name',
    sortable: true,
    label: 'destinationPlan',
  },
  8: {
    id: 8,
    identifierID: 'destination.location.name',
    sortable: true,
    label: 'destinationCountry',
  },
  9: {
    id: 9,
    identifierID: 'destination.usageYear.year',
    sortable: true,
    label: 'destinationYear',
  },
  10: { id: 10, identifierID: 'details', label: 'details' },
};
export const DEFAULT_TABLE_HEADERS: TableHeadersProps[] = [];
for (let i = 1; i <= 10; i++) {
  DEFAULT_TABLE_HEADERS.push(POSSIBLE_HEADER_VALUES[i]);
}

const defaultEncodeTableHeaders = () => {
  let res = '';
  DEFAULT_TABLE_HEADERS.map(
    (header, index) =>
      (res = res.concat(
        `${header.id}${DEFAULT_TABLE_HEADERS.length - 1 !== index ? '_' : ''}`
      ))
  );
  return res;
};
/**
 * Encodes the query param to obtain a string suitable for the URL, use it alongside decodeTableHeaders()
 *
 * @param headers
 * @returns string
 */
export const encodeTableHeaders = (
  headers: {
    id: number;
    label: keyof Strings['components']['flowsTable']['headers'];
    active: boolean;
  }[],
  setQuery?: (newQuery: Query) => void,
  query?: Query
): string => {
  if (headers.length === 0) {
    return defaultEncodeTableHeaders();
  }
  try {
    let res = '';
    headers.map(
      (header, index) =>
        (res = res.concat(
          `${!header.active ? '-' : ''}${header.id}${
            headers.length - 1 !== index ? '_' : ''
          }`
        ))
    );
    return res;
  } catch (error) {
    console.error(error);
    const errorDefaultTableHeaders = defaultEncodeTableHeaders();
    if (query && setQuery) {
      setQuery({ ...query, tableHeaders: errorDefaultTableHeaders });
    }
    return errorDefaultTableHeaders;
  }
};

const defaultDecodeTableHeaders = (lang: LanguageKey) =>
  DEFAULT_TABLE_HEADERS.map((header) => ({
    id: header.id,
    label: header.label,
    displayLabel: t.t(
      lang,
      (s) =>
        s.components.flowsTable.headers[POSSIBLE_HEADER_VALUES[header.id].label]
    ),
    active: true,
    identifierID: header.identifierID,
    sortable: header.sortable,
  }));

/**
 * Decodes the query param to obtain an ordered list of table headers
 *
 * @param queryParam
 * @returns { id: number; label: string; active: boolean }[]
 */
export const decodeTableHeaders = (
  queryParam: string,
  lang: LanguageKey,
  setQuery?: (newQuery: Query) => void,
  query?: Query
): {
  id: number;
  label: keyof Strings['components']['flowsTable']['headers'];
  displayLabel: string;
  active: boolean;
  identifierID: HeaderID;
  sortable?: boolean;
}[] => {
  if (queryParam.trim() === '') {
    return defaultDecodeTableHeaders(lang);
  }
  try {
    return queryParam.split('_').map((x) => ({
      id: Math.abs(parseInt(x)),
      label: POSSIBLE_HEADER_VALUES[Math.abs(parseInt(x))].label,
      displayLabel: t.t(
        lang,
        (s) =>
          s.components.flowsTable.headers[
            POSSIBLE_HEADER_VALUES[Math.abs(parseInt(x))].label
          ]
      ),
      active: parseInt(x) > 0,
      identifierID: POSSIBLE_HEADER_VALUES[Math.abs(parseInt(x))].identifierID,
      sortable: POSSIBLE_HEADER_VALUES[Math.abs(parseInt(x))].sortable,
    }));
  } catch (error) {
    console.error(error);
    const errorDefaultTableHeaders = defaultEncodeTableHeaders();
    if (setQuery && query) {
      setQuery({ ...query, tableHeaders: errorDefaultTableHeaders });
    }
    return defaultDecodeTableHeaders(lang);
  }
};
