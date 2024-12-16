import * as t from 'io-ts';
import { util } from '@unocha/hpc-data';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  DEFAULT_KEYWORD_TABLE_HEADERS,
  DEFAULT_ORGANIZATION_TABLE_HEADERS,
  FlowHeaderID,
  KeywordHeaderID,
  OrganizationHeaderID,
  TableHeadersProps,
} from './table-headers';

const PARAMS_CODEC = t.intersection([
  t.type({
    page: util.INTEGER_FROM_STRING,
    rowsPerPage: util.INTEGER_FROM_STRING,
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
    (acc, { identifierID: id }) => {
      acc[id] = id;
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
