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
const ROWS_PER_PAGE = new t.Type<number, number>(
  'ROWS_PER_PAGE',
  t.number.is,
  (v, c) => {
    if (typeof v === 'number') {
      return Number.isInteger(v) &&
        ROWS_PER_PAGE_OPTIONS.some((row) => row === v)
        ? t.success(v)
        : t.failure(v, c);
    } else if (typeof v === 'string') {
      return /^[0-9]+$/.test(v) &&
        ROWS_PER_PAGE_OPTIONS.some((row) => row === parseInt(v))
        ? t.success(parseInt(v))
        : t.failure(v, c);
    } else {
      return t.failure(v, c);
    }
  },
  t.identity
);

const PARAMS_CODEC = t.intersection([
  t.type({
    page: util.INTEGER_FROM_STRING,
    rowsPerPage: ROWS_PER_PAGE,
    orderDir: t.keyof({
      ASC: 'ASC',
      DESC: 'DESC',
    }),
    filters: t.string,
    tableHeaders: t.string,
  }),
  t.partial({
    prevPageCursor: util.INTEGER_FROM_STRING,
    nextPageCursor: util.INTEGER_FROM_STRING,
  }),
]);

const extractIdentifierIds = <
  T extends OrganizationHeaderID | FlowHeaderID | KeywordHeaderID,
>(
  val: TableHeadersProps<T>[]
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
