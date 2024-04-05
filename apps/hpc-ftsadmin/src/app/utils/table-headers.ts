import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { Query } from '../components/tables/table-utils';
import { FilterKeys } from './parse-filters';

/** Declare which tables there can be */
export type TableType = 'flows' | 'organizations' | 'keywords';

/** The nomenclature to define these IDs is to write it like: name of the DB table, and after the dot, the propperty.
 *  if it's not a DB field, just write down the name
 */

export type FlowHeaderID =
  | 'flow.id'
  | 'flow.versionID'
  | 'flow.updatedAt'
  | 'flow.exchangeRate'
  | 'flow.flowDate'
  | 'flow.newMoney'
  | 'flow.decisionDate'
  | 'externalReference.systemID'
  | 'flow.amountUSD'
  | 'organization.source.name'
  | 'organization.destination.name'
  | 'planVersion.destination.name'
  | 'location.destination.name'
  | 'usageYear.destination.year'
  | 'details'
  | 'reportDetail.sourceID'
  | 'reportDetail.reporterRefCode';

export type OrganizationHeaderID =
  | 'organization.id'
  | 'organization.name'
  | 'organization.abbreviation'
  | 'organization.type'
  | 'organization.subType'
  | 'organization.location'
  | 'organization.createdBy'
  | 'organization.updatedBy';

export type KeywordHeaderID =
  | 'keyword.id'
  | 'keyword.name'
  | 'keyword.relatedFlows'
  | 'keyword.public';
export interface TableHeadersProps<
  T extends OrganizationHeaderID | FlowHeaderID | KeywordHeaderID,
> {
  id: number;
  identifierID: T;
  label: T extends FlowHeaderID
    ? keyof Strings['components']['flowsTable']['headers']
    : T extends OrganizationHeaderID
    ? keyof Strings['components']['organizationTable']['headers']
    : keyof Strings['components']['keywordTable']['headers'];
  sortable?: boolean;
  active?: boolean;
  displayLabel?: string;
}

type HeaderType = {
  id: number;
  label: FilterKeys;
  active: boolean;
};
/** We create these POSSIBLE consts because in the future we want to add more fields than the default ones displayed */

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
    identifierID: 'organization.source.name',
    sortable: true,
    label: 'sourceOrganization',
  },
  6: {
    id: 6,
    identifierID: 'organization.destination.name',
    sortable: true,
    label: 'destinationOrganization',
  },
  7: {
    id: 7,
    identifierID: 'planVersion.destination.name',
    sortable: true,
    label: 'destinationPlan',
  },
  8: {
    id: 8,
    identifierID: 'location.destination.name',
    sortable: true,
    label: 'destinationCountry',
  },
  9: {
    id: 9,
    identifierID: 'usageYear.destination.year',
    sortable: true,
    label: 'destinationYear',
  },
  10: { id: 10, identifierID: 'details', label: 'details' },
  11: {
    id: 11,
    identifierID: 'flow.exchangeRate',
    label: 'exchangeRate',
    sortable: true,
  },
  12: {
    id: 12,
    identifierID: 'flow.newMoney',
    label: 'newMoney',
    sortable: true,
  },
  13: {
    id: 13,
    identifierID: 'flow.decisionDate',
    label: 'decisionDate',
    sortable: true,
  },
  14: {
    id: 14,
    identifierID: 'flow.flowDate',
    label: 'flowDate',
    sortable: true,
  },
  15: {
    id: 15,
    identifierID: 'reportDetail.sourceID',
    label: 'sourceID',
    sortable: true,
  },
  16: {
    id: 16,
    identifierID: 'reportDetail.reporterRefCode',
    label: 'reporterRefCode',
    sortable: true,
  },
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

export const POSSIBLE_KEYWORD_VALUES: Record<
  number,
  TableHeadersProps<KeywordHeaderID>
> = {
  1: { id: 1, identifierID: 'keyword.id', label: 'id', sortable: true },
  2: { id: 2, identifierID: 'keyword.name', label: 'name', sortable: true },
  3: {
    id: 3,
    identifierID: 'keyword.relatedFlows',
    label: 'relatedFlows',
    sortable: true,
  },
  4: {
    id: 4,
    identifierID: 'keyword.public',
    label: 'public',
    sortable: false,
  },
};

/** When adding more new field to POSSIBLE consts that are not default, modify as needed */

export const DEFAULT_FLOW_TABLE_HEADERS: TableHeadersProps<FlowHeaderID>[] = [];
for (const [index, header] of Object.entries(POSSIBLE_FLOW_HEADER_VALUES)) {
  const i = parseInt(index);
  if (i <= 10)
    DEFAULT_FLOW_TABLE_HEADERS.push({
      ...header,
      active: true,
    });
  else
    DEFAULT_FLOW_TABLE_HEADERS.push({
      ...header,
      active: false,
    });
}
export const DEFAULT_ORGANIZATION_TABLE_HEADERS: TableHeadersProps<OrganizationHeaderID>[] =
  [];
for (const [index, header] of Object.entries(POSSIBLE_ORGANIZATION_VALUES)) {
  DEFAULT_ORGANIZATION_TABLE_HEADERS.push(header);
}
export const DEFAULT_KEYWORD_TABLE_HEADERS: TableHeadersProps<KeywordHeaderID>[] =
  [];
for (const [index, header] of Object.entries(POSSIBLE_KEYWORD_VALUES)) {
  DEFAULT_KEYWORD_TABLE_HEADERS.push(header);
}

/**
 * Sets up the default values
 */
const defaultEncodeTableHeaders = (table: TableType) => {
  let res = '';
  if (table === 'flows') {
    DEFAULT_FLOW_TABLE_HEADERS.map(
      (header, index) =>
        (res = res.concat(
          `${header.active ? header.id : -header.id}${
            DEFAULT_FLOW_TABLE_HEADERS.length - 1 !== index ? '_' : ''
          }`
        ))
    );
  } else if (table === 'keywords') {
    DEFAULT_KEYWORD_TABLE_HEADERS.map(
      (header, index) =>
        (res = res.concat(
          `${header.id}${
            DEFAULT_KEYWORD_TABLE_HEADERS.length - 1 !== index ? '_' : ''
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
 */
export const encodeTableHeaders = (
  headers: Array<HeaderType>,
  table: TableType = 'flows',
  query?: Query,
  setQuery?: (newQuery: Query) => void
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

/**
 * Sets up the default values
 */
const defaultDecodeTableHeaders = (
  lang: LanguageKey,
  table: TableType = 'flows'
): TableHeadersProps<
  FlowHeaderID | OrganizationHeaderID | KeywordHeaderID
>[] => {
  if (table === 'flows') {
    return DEFAULT_FLOW_TABLE_HEADERS.map((header) => ({
      id: header.id,
      label: header.label,
      active: header.active,
      displayLabel: t.t(
        lang,
        (s) =>
          s.components.flowsTable.headers[
            POSSIBLE_FLOW_HEADER_VALUES[header.id].label
          ]
      ),
      identifierID: header.identifierID,
      sortable: header.sortable,
    }));
  } else if (table === 'keywords') {
    return DEFAULT_KEYWORD_TABLE_HEADERS.map((header) => ({
      id: header.id,
      label: header.label,
      displayLabel: t.t(
        lang,
        (s) =>
          s.components.keywordTable.headers[
            POSSIBLE_KEYWORD_VALUES[header.id].label
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
 */
export const decodeTableHeaders = (
  queryParam: string,
  lang: LanguageKey,
  table: TableType = 'flows',
  query?: Query,
  setQuery?: (newQuery: Query) => void
): Array<
  TableHeadersProps<FlowHeaderID | OrganizationHeaderID | KeywordHeaderID>
> => {
  if (queryParam.trim() === '') {
    return defaultDecodeTableHeaders(lang, table);
  }
  try {
    return queryParam.split('_').map((x) => {
      const possibleValues =
        table === 'flows'
          ? POSSIBLE_FLOW_HEADER_VALUES[Math.abs(parseInt(x))]
          : table === 'keywords'
          ? POSSIBLE_KEYWORD_VALUES[Math.abs(parseInt(x))]
          : POSSIBLE_ORGANIZATION_VALUES[Math.abs(parseInt(x))];
      return {
        id: Math.abs(parseInt(x)),
        label: possibleValues.label,
        displayLabel: t.t(lang, (s) =>
          table === 'flows'
            ? s.components.flowsTable.headers[
                POSSIBLE_FLOW_HEADER_VALUES[Math.abs(parseInt(x))].label
              ]
            : table === 'keywords'
            ? s.components.keywordTable.headers[
                POSSIBLE_KEYWORD_VALUES[Math.abs(parseInt(x))].label
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

export const isTableHeadersPropsFlow = (
  headers: Array<
    TableHeadersProps<FlowHeaderID | OrganizationHeaderID | KeywordHeaderID>
  >
): headers is Array<TableHeadersProps<FlowHeaderID>> => {
  const possibleIdentifierIDs: string[] = Object.values(
    POSSIBLE_FLOW_HEADER_VALUES
  ).map((header) => header.identifierID);
  for (const header of headers) {
    if (!possibleIdentifierIDs.includes(header.identifierID)) {
      return false;
    }
  }
  return true;
};

export const isTableHeadersPropsOrganization = (
  headers: Array<
    TableHeadersProps<FlowHeaderID | OrganizationHeaderID | KeywordHeaderID>
  >
): headers is Array<TableHeadersProps<OrganizationHeaderID>> => {
  const possibleIdentifierIDs: string[] = Object.values(
    POSSIBLE_ORGANIZATION_VALUES
  ).map((header) => header.identifierID);
  for (const header of headers) {
    if (!possibleIdentifierIDs.includes(header.identifierID)) {
      return false;
    }
  }
  return true;
};

export const isTableHeadersPropsKeyword = (
  headers: Array<
    TableHeadersProps<FlowHeaderID | OrganizationHeaderID | KeywordHeaderID>
  >
): headers is Array<TableHeadersProps<KeywordHeaderID>> => {
  const possibleIdentifierIDs: string[] = Object.values(
    POSSIBLE_KEYWORD_VALUES
  ).map((header) => header.identifierID);
  for (const header of headers) {
    if (!possibleIdentifierIDs.includes(header.identifierID)) {
      return false;
    }
  }
  return true;
};

export const isCompatibleTableHeaderType = (
  element: Array<object>
): element is Array<HeaderType> => {
  const keys = Object.keys(element[0]);
  return (
    keys.includes('id') && keys.includes('label') && keys.includes('active')
  );
};
