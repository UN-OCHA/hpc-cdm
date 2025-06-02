import { type LanguageKey, t } from '../../i18n';
import { type Strings } from '../../i18n/iface';
import type { Query, SetQuery } from '../components/tables/table-utils';
import { type FilterKey } from './parse-filters';

/**
 * Declare which tables there can be
 */
export type TableType = 'flows' | 'organizations' | 'keywords';

/*
 * The nomenclature to define these IDs is to write it like:
 * name of the DB table, and after the dot, the property.
 * If it's not a DB field, just write down the name.
 */

export type FlowHeaderID =
  | 'flow.id'
  | 'status'
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

type MapTableTypeToHeaderType = {
  flows: {
    headerId: FlowHeaderID;
    label: keyof Strings['components']['flowsTable']['headers'];
  };
  organizations: {
    headerId: OrganizationHeaderID;
    label: keyof Strings['components']['organizationsTable']['headers'];
  };
  keywords: {
    headerId: KeywordHeaderID;
    label: keyof Strings['components']['keywordsTable']['headers'];
  };
};
export interface TableHeadersProps<T extends TableType> {
  id: number;
  identifierID: MapTableTypeToHeaderType[T]['headerId'];
  label: MapTableTypeToHeaderType[T]['label'];
  isSortable?: boolean;
  isActive?: boolean;
  displayLabel?: string;
}

type HeaderType = {
  id: number;
  label: FilterKey;
  isActive: boolean;
};

type DecodeTableHeadersProps<T extends Query, K extends TableType> = {
  queryParam: string;
  lang: LanguageKey;
  table: K;
  query?: T;
  setQuery?: SetQuery<T>;
  isPending?: boolean;
};
type EncodeTableHeadersProps<T extends Query, K extends TableType> = {
  headers: HeaderType[];
  table: K;
  query?: T;
  setQuery?: SetQuery<T>;
  isPending?: boolean;
};

type TableHeaderConfig<T extends TableType> = {
  defaultHeaders: Array<TableHeadersProps<T>>;
  possibleHeaders: Record<number, TableHeadersProps<T>>;
};

/*
 * We create these `POSSIBLE_*` consts because in the future
 * we want to add more fields than the default ones displayed
 */

const POSSIBLE_FLOW_TABLE_HEADERS: Record<
  number,
  TableHeadersProps<'flows'>
> = {
  1: {
    id: 1,
    identifierID: 'flow.id',
    isSortable: true,
    label: 'id',
  },
  2: {
    id: 2,
    identifierID: 'status',
    isSortable: true,
    label: 'status',
  },
  3: {
    id: 3,
    identifierID: 'flow.updatedAt',
    isSortable: true,
    label: 'updatedCreated',
  },
  4: {
    id: 4,
    identifierID: 'externalReference.systemID',
    isSortable: true,
    label: 'dataProvider',
  },
  5: {
    id: 5,
    identifierID: 'flow.amountUSD',
    isSortable: true,
    label: 'amountUSD',
  },
  6: {
    id: 6,
    identifierID: 'organization.source.name',
    isSortable: true,
    label: 'sourceOrganization',
  },
  7: {
    id: 7,
    identifierID: 'organization.destination.name',
    isSortable: true,
    label: 'destinationOrganization',
  },
  8: {
    id: 8,
    identifierID: 'planVersion.destination.name',
    isSortable: true,
    label: 'destinationPlan',
  },
  9: {
    id: 9,
    identifierID: 'location.destination.name',
    isSortable: true,
    label: 'destinationCountry',
  },
  10: {
    id: 10,
    identifierID: 'usageYear.destination.year',
    isSortable: true,
    label: 'destinationYear',
  },
  11: { id: 11, identifierID: 'details', label: 'details' },
  12: {
    id: 12,
    identifierID: 'flow.exchangeRate',
    label: 'exchangeRate',
    isSortable: true,
  },
  13: {
    id: 13,
    identifierID: 'flow.newMoney',
    label: 'newMoney',
    isSortable: true,
  },
  14: {
    id: 14,
    identifierID: 'flow.decisionDate',
    label: 'decisionDate',
    isSortable: true,
  },
  15: {
    id: 15,
    identifierID: 'flow.flowDate',
    label: 'flowDate',
    isSortable: true,
  },
  16: {
    id: 16,
    identifierID: 'reportDetail.sourceID',
    label: 'sourceID',
    isSortable: false,
  },
  17: {
    id: 17,
    identifierID: 'reportDetail.reporterRefCode',
    label: 'reporterRefCode',
    isSortable: false,
  },
};

const POSSIBLE_ORGANIZATION_TABLE_HEADERS: Record<
  number,
  TableHeadersProps<'organizations'>
> = {
  1: {
    id: 1,
    identifierID: 'organization.id',
    isSortable: true,
    label: 'id',
  },
  2: {
    id: 2,
    identifierID: 'organization.name',
    isSortable: true,
    label: 'name',
  },
  3: {
    id: 3,
    identifierID: 'organization.abbreviation',
    isSortable: true,
    label: 'abbreviation',
  },
  4: {
    id: 4,
    identifierID: 'organization.type',
    isSortable: false,
    label: 'type',
  },
  5: {
    id: 5,
    identifierID: 'organization.subType',
    isSortable: false,
    label: 'subType',
  },
  6: {
    id: 6,
    identifierID: 'organization.location',
    isSortable: false,
    label: 'location',
  },
  7: {
    id: 7,
    identifierID: 'organization.createdBy',
    isSortable: false,
    label: 'createdBy',
  },
  8: {
    id: 8,
    identifierID: 'organization.updatedBy',
    isSortable: false,
    label: 'updatedBy',
  },
};

const POSSIBLE_KEYWORD_TABLE_HEADERS: Record<
  number,
  TableHeadersProps<'keywords'>
> = {
  1: { id: 1, identifierID: 'keyword.id', label: 'id', isSortable: true },
  2: { id: 2, identifierID: 'keyword.name', label: 'name', isSortable: true },
  3: {
    id: 3,
    identifierID: 'keyword.relatedFlows',
    label: 'relatedFlows',
    isSortable: true,
  },
  4: {
    id: 4,
    identifierID: 'keyword.public',
    label: 'public',
    isSortable: false,
  },
};

/**
 *  When adding more new field to POSSIBLE consts that are not default.
 */
const FLOW_ACTIVE_HEADERS_UNTIL_ID = 11;
export const DEFAULT_FLOW_TABLE_HEADERS: Array<TableHeadersProps<'flows'>> =
  Object.entries(POSSIBLE_FLOW_TABLE_HEADERS).map(([index, header]) => {
    const i = parseInt(index);
    // Should only be default active in pending flows page
    if (header.identifierID === 'status') {
      return {
        ...header,
        isActive: false,
      } satisfies TableHeadersProps<'flows'>;
    }
    return {
      ...header,
      isActive: i <= FLOW_ACTIVE_HEADERS_UNTIL_ID,
    } satisfies TableHeadersProps<'flows'>;
  });

export const DEFAULT_ORGANIZATION_TABLE_HEADERS: Array<
  TableHeadersProps<'organizations'>
> = Object.values(POSSIBLE_ORGANIZATION_TABLE_HEADERS).map(
  (header) =>
    ({ ...header, isActive: true }) satisfies TableHeadersProps<'organizations'>
);

export const DEFAULT_KEYWORD_TABLE_HEADERS: Array<
  TableHeadersProps<'keywords'>
> = Object.values(POSSIBLE_KEYWORD_TABLE_HEADERS).map(
  (header) =>
    ({ ...header, isActive: true }) satisfies TableHeadersProps<'keywords'>
);

const TABLE_TO_TABLE_HEADERS: {
  [K in TableType]: TableHeaderConfig<K>;
} = {
  flows: {
    defaultHeaders: DEFAULT_FLOW_TABLE_HEADERS,
    possibleHeaders: POSSIBLE_FLOW_TABLE_HEADERS,
  },
  keywords: {
    defaultHeaders: DEFAULT_KEYWORD_TABLE_HEADERS,
    possibleHeaders: POSSIBLE_KEYWORD_TABLE_HEADERS,
  },
  organizations: {
    defaultHeaders: DEFAULT_ORGANIZATION_TABLE_HEADERS,
    possibleHeaders: POSSIBLE_ORGANIZATION_TABLE_HEADERS,
  },
};

/**
 * Sets up the default values
 */
const defaultEncodeTableHeaders = <T extends TableType>(
  table: T,
  isPending?: boolean
) => {
  const defaultHeaders = TABLE_TO_TABLE_HEADERS[table].defaultHeaders;

  let res = '';
  for (const [index, header] of defaultHeaders.entries()) {
    if (isPending && header.identifierID === 'status') {
      res += `${header.id}${defaultHeaders.length - 1 !== index ? '_' : ''}`;
      continue;
    }
    res += `${header.isActive ? header.id : -header.id}${
      defaultHeaders.length - 1 !== index ? '_' : ''
    }`;
  }
  return res;
};

/**
 * Encodes the query param to obtain a string suitable for the URL,
 * use it alongside `decodeTableHeaders()`
 */
export const encodeTableHeaders = <T extends Query, K extends TableType>({
  headers,
  table,
  isPending,
  query,
  setQuery,
}: EncodeTableHeadersProps<T, K>): string => {
  if (headers.length === 0) {
    return defaultEncodeTableHeaders(table, isPending);
  }
  try {
    return headers
      .map(
        (header, index) =>
          `${!header.isActive ? '-' : ''}${header.id}${
            headers.length - 1 !== index ? '_' : ''
          }`
      )
      .join('');
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
const defaultDecodeTableHeaders = <T extends TableType>(
  lang: LanguageKey,
  table: T,
  isPending?: boolean
): Array<TableHeadersProps<T>> => {
  const { possibleHeaders, defaultHeaders } = TABLE_TO_TABLE_HEADERS[table];
  const parsedDefaultHeaders = isPending
    ? defaultHeaders.map((header) => {
        if (header.identifierID === 'status') {
          return { ...header, isActive: true };
        }
        return header;
      })
    : defaultHeaders;
  const headerName = `${table}Table` as const;
  return parsedDefaultHeaders.map(
    ({ id, label, isActive, identifierID, isSortable }) =>
      ({
        id,
        label,
        isActive,
        displayLabel: t.t(lang, (s) => {
          const labels = s.components[headerName].headers as Record<
            MapTableTypeToHeaderType[T]['label'],
            string
          >;
          return labels[possibleHeaders[id].label];
        }),
        identifierID,
        isSortable,
      }) satisfies TableHeadersProps<T>
  );
};
/**
 * Decodes the query param to obtain an ordered list of table headers
 */
export const decodeTableHeaders = <T extends Query, K extends TableType>({
  queryParam,
  lang,
  table,
  query,
  setQuery,
  isPending,
}: DecodeTableHeadersProps<T, K>): Array<TableHeadersProps<K>> => {
  if (queryParam.trim() === '') {
    return defaultDecodeTableHeaders(lang, table, isPending);
  }
  try {
    return queryParam.split('_').map((tableIDWithSymbol) => {
      const tableID = Math.abs(parseInt(tableIDWithSymbol));
      const possibleHeaders = TABLE_TO_TABLE_HEADERS[table].possibleHeaders;
      const tableName = `${table}Table` as const;

      const { label, identifierID, isSortable } = possibleHeaders[tableID];

      return {
        id: tableID,
        label,
        displayLabel: t.t(lang, (s) => {
          const labels = s.components[tableName].headers as Record<
            MapTableTypeToHeaderType[K]['label'],
            string
          >;
          return labels[label];
        }),
        isActive: parseInt(tableIDWithSymbol) > 0,
        identifierID,
        isSortable,
      } satisfies TableHeadersProps<K>;
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

/**
 *  Parses `label` to its translated value
 */
export const getDraggableTableHeaders = <T extends Query, K extends TableType>(
  decodeTableHeadersProps: DecodeTableHeadersProps<T, K>
) => {
  const decodedTableHeaders = decodeTableHeaders(decodeTableHeadersProps);
  return decodedTableHeaders.map((decodedTableHeader) => {
    const tableName = `${decodeTableHeadersProps.table}Table` as const;
    const tableLabel = decodedTableHeader.label;

    return {
      ...decodedTableHeader,
      label: t.t(
        decodeTableHeadersProps.lang,
        (s) => s.components[tableName].headers[tableLabel as never]
      ),
    };
  });
};
export const isCompatibleTableHeaderType = (
  element: object[]
): element is HeaderType[] => {
  const keys = Object.keys(element[0]);
  return (
    keys.includes('id') && keys.includes('label') && keys.includes('isActive')
  );
};
