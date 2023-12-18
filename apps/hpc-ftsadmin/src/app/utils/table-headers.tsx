import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { Query } from '../components/tables/table-utils';

export type TableType = 'flows' | 'organizations';
export type FlowHeaderID =
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

export type OrganizationHeaderID =
  | 'organization.id'
  | 'organization.name'
  | 'organization.abbreviation'
  | 'organization.type'
  | 'organization.subType'
  | 'organization.location'
  | 'organization.createdBy'
  | 'organization.updatedBy';

export interface TableHeadersProps<
  T extends OrganizationHeaderID | FlowHeaderID
> {
  id: number;
  identifierID: T;
  label: T extends FlowHeaderID
    ? keyof Strings['components']['flowsTable']['headers']
    : keyof Strings['components']['organizationTable']['headers'];
  sortable?: boolean;
  active?: boolean;
  displayLabel?: string;
}
export const POSSIBLE_FLOW_HEADER_VALUES: Record<
  number,
  TableHeadersProps<FlowHeaderID>
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

export const POSSIBLE_ORGANIZATION_VALUES: Record<
  number,
  TableHeadersProps<OrganizationHeaderID>
> = {
  1: {
    id: 1,
    identifierID: 'organization.id',
    sortable: true,
    label: 'id',
  },
  2: {
    id: 2,
    identifierID: 'organization.name',
    sortable: true,
    label: 'name',
  },
  3: {
    id: 3,
    identifierID: 'organization.abbreviation',
    sortable: true,
    label: 'abbreviation',
  },
  4: {
    id: 4,
    identifierID: 'organization.type',
    sortable: true,
    label: 'type',
  },
  5: {
    id: 5,
    identifierID: 'organization.subType',
    sortable: true,
    label: 'subType',
  },
  6: {
    id: 6,
    identifierID: 'organization.location',
    sortable: true,
    label: 'location',
  },
  7: {
    id: 7,
    identifierID: 'organization.createdBy',
    sortable: true,
    label: 'createdBy',
  },
  8: {
    id: 8,
    identifierID: 'organization.updatedBy',
    sortable: true,
    label: 'updatedBy',
  },
};
export const DEFAULT_FLOW_TABLE_HEADERS: TableHeadersProps<FlowHeaderID>[] = [];
for (let i = 1; i <= 10; i++) {
  DEFAULT_FLOW_TABLE_HEADERS.push(POSSIBLE_FLOW_HEADER_VALUES[i]);
}
export const DEFAULT_ORGANIZATION_TABLE_HEADERS: TableHeadersProps<OrganizationHeaderID>[] =
  [];
for (let i = 1; i <= 8; i++) {
  DEFAULT_ORGANIZATION_TABLE_HEADERS.push(POSSIBLE_ORGANIZATION_VALUES[i]);
}

const defaultEncodeTableHeaders = (table: TableType) => {
  let res = '';
  if (table === 'flows') {
    DEFAULT_FLOW_TABLE_HEADERS.map(
      (header, index) =>
        (res = res.concat(
          `${header.id}${
            DEFAULT_FLOW_TABLE_HEADERS.length - 1 !== index ? '_' : ''
          }`
        ))
    );
  } else {
    DEFAULT_ORGANIZATION_TABLE_HEADERS.map(
      (header, index) =>
        (res = res.concat(
          `${header.id}${
            DEFAULT_ORGANIZATION_TABLE_HEADERS.length - 1 !== index ? '_' : ''
          }`
        ))
    );
  }
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
  table: TableType = 'flows',
  setQuery?: (newQuery: Query) => void,
  query?: Query
): string => {
  if (headers.length === 0) {
    return defaultEncodeTableHeaders(table);
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
    const errorDefaultTableHeaders = defaultEncodeTableHeaders(table);
    if (query && setQuery) {
      setQuery({ ...query, tableHeaders: errorDefaultTableHeaders });
    }
    return errorDefaultTableHeaders;
  }
};

const defaultDecodeTableHeaders = (
  lang: LanguageKey,
  table: TableType = 'flows'
): TableHeadersProps<FlowHeaderID | OrganizationHeaderID>[] => {
  if (table === 'flows') {
    return DEFAULT_FLOW_TABLE_HEADERS.map((header) => ({
      id: header.id,
      label: header.label,
      displayLabel: t.t(
        lang,
        (s) =>
          s.components.flowsTable.headers[
            POSSIBLE_FLOW_HEADER_VALUES[header.id].label
          ]
      ),
      active: true,
      identifierID: header.identifierID,
      sortable: header.sortable,
    }));
  } else {
    return DEFAULT_ORGANIZATION_TABLE_HEADERS.map((header) => ({
      id: header.id,
      label: header.label,
      displayLabel: t.t(
        lang,
        (s) =>
          s.components.organizationTable.headers[
            POSSIBLE_ORGANIZATION_VALUES[header.id].label
          ]
      ),
      active: true,
      identifierID: header.identifierID,
      sortable: header.sortable,
    }));
  }
};
/**
 * Decodes the query param to obtain an ordered list of table headers
 *
 * @param queryParam
 * @returns { id: number; label: string; active: boolean }[]
 */
export const decodeTableHeaders = (
  queryParam: string,
  lang: LanguageKey,
  table: TableType = 'flows',
  setQuery?: (newQuery: Query) => void,
  query?: Query
): TableHeadersProps<FlowHeaderID | OrganizationHeaderID>[] => {
  if (queryParam.trim() === '') {
    return defaultDecodeTableHeaders(lang, table);
  }
  try {
    return queryParam.split('_').map((x) => {
      const possibleValues =
        table === 'flows'
          ? POSSIBLE_FLOW_HEADER_VALUES[Math.abs(parseInt(x))]
          : POSSIBLE_ORGANIZATION_VALUES[Math.abs(parseInt(x))];
      return {
        id: Math.abs(parseInt(x)),
        label: possibleValues.label,
        displayLabel: t.t(lang, (s) =>
          table === 'flows'
            ? s.components.flowsTable.headers[
                POSSIBLE_FLOW_HEADER_VALUES[Math.abs(parseInt(x))].label
              ]
            : s.components.organizationTable.headers[
                POSSIBLE_ORGANIZATION_VALUES[Math.abs(parseInt(x))].label
              ]
        ),
        active: parseInt(x) > 0,
        identifierID: possibleValues.identifierID,
        sortable: possibleValues.sortable,
      };
    });
  } catch (error) {
    console.error(error);
    const errorDefaultTableHeaders = defaultEncodeTableHeaders(table);
    if (setQuery && query) {
      setQuery({ ...query, tableHeaders: errorDefaultTableHeaders });
    }
    return defaultDecodeTableHeaders(lang, table);
  }
};
