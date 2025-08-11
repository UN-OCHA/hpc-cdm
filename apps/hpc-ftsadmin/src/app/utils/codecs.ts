import { util } from '@unocha/hpc-data';
import * as t from 'io-ts';
import { ROWS_PER_PAGE_OPTIONS } from './constants';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  DEFAULT_KEYWORD_TABLE_HEADERS,
  DEFAULT_ORGANIZATION_TABLE_HEADERS,
  type TableHeadersProps,
  type TableType,
} from './table-headers';

const ROWS_PER_PAGE = util.validInteger(ROWS_PER_PAGE_OPTIONS);

const PARAMS_CODEC = t.type({
  page: util.INTEGER_FROM_STRING,
  rowsPerPage: ROWS_PER_PAGE,
  orderDir: t.keyof({
    ASC: null,
    DESC: null,
  }),
  filters: t.string,
  tableHeaders: t.string,
});

const extractIdentifierIds = <T extends TableType>(
  val: Array<TableHeadersProps<T>>
) => {
  return val.reduce(
    (acc, { identifierID: id, isSortable }) => {
      if (isSortable) {
        acc[id] = null;
      }
      return acc;
    },
    {} as Record<TableHeadersProps<T>['identifierID'], null>
  );
};

export const FLOW_PARAMS_CODEC = t.exact(
  t.intersection([
    PARAMS_CODEC,
    t.type({
      orderBy: t.keyof(extractIdentifierIds(DEFAULT_FLOW_TABLE_HEADERS)),
    }),
  ])
);

export const ORGANIZATION_PARAMS_CODEC = t.exact(
  t.intersection([
    PARAMS_CODEC,
    t.type({
      orderBy: t.keyof(
        extractIdentifierIds(DEFAULT_ORGANIZATION_TABLE_HEADERS)
      ),
    }),
  ])
);

export const KEYWORD_PARAMS_CODEC = t.exact(
  t.type({
    orderBy: t.keyof(extractIdentifierIds(DEFAULT_KEYWORD_TABLE_HEADERS)),
    orderDir: t.keyof({
      ASC: null,
      DESC: null,
    }),
    tableHeaders: t.string,
  })
);
