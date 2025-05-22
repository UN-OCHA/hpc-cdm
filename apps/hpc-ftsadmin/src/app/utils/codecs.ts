import * as t from 'io-ts';
import { util } from '@unocha/hpc-data';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  DEFAULT_KEYWORD_TABLE_HEADERS,
  DEFAULT_ORGANIZATION_TABLE_HEADERS,
  type FlowHeaderID,
  type KeywordHeaderID,
  type OrganizationHeaderID,
  type TableHeadersProps,
} from './table-headers';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
const ROWS_PER_PAGE = util.validInteger(ROWS_PER_PAGE_OPTIONS);

const PARAMS_CODEC = t.type({
  page: util.INTEGER_FROM_STRING,
  rowsPerPage: ROWS_PER_PAGE,
  orderDir: t.keyof({
    ASC: 'ASC',
    DESC: 'DESC',
  }),
  filters: t.string,
  tableHeaders: t.string,
});

const extractIdentifierIds = <
  T extends OrganizationHeaderID | FlowHeaderID | KeywordHeaderID,
>(
  val: Array<TableHeadersProps<T>>
) => {
  return val.reduce(
    (acc, { identifierID: id, sortable }) => {
      if (sortable) {
        acc[id] = id;
      }
      return acc;
    },
    {} as Record<T, string>
  );
};

export const FLOW_PARAMS_CODEC = t.intersection([
  PARAMS_CODEC,
  t.type({
    orderBy: t.keyof(extractIdentifierIds(DEFAULT_FLOW_TABLE_HEADERS)),
  }),
]);

export const ORGANIZATION_PARAMS_CODEC = t.intersection([
  PARAMS_CODEC,
  t.type({
    orderBy: t.keyof(extractIdentifierIds(DEFAULT_ORGANIZATION_TABLE_HEADERS)),
  }),
]);

export const KEYWORD_PARAMS_CODEC = t.type({
  orderBy: t.keyof(extractIdentifierIds(DEFAULT_KEYWORD_TABLE_HEADERS)),
  orderDir: t.keyof({
    ASC: 'ASC',
    DESC: 'DESC',
  }),
  tableHeaders: t.string,
});
