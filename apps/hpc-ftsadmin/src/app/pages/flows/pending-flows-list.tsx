import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext } from '../../context';
import {
  JsonParam,
  NumberParam,
  StringParam,
  createEnumParam,
  decodeNumber,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import FilterPendingFlowsTable, {
  PENDING_FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-pending-flows-table';
import tw from 'twin.macro';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  encodeTableHeaders,
} from '../../utils/table-headers';
import FlowsTable, {
  FlowsTableProps,
} from '../../components/tables/flows-table';
import { useCallback, useEffect, useRef } from 'react';

interface Props {
  className?: string;
}
const Container = tw.div`
  flex
`;
const LandingContainer = tw.div`
  w-full
`;

export default (props: Props) => {
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 0),
    rowsPerPage: withDefault(
      {
        ...NumberParam,
        decode: (string) => {
          // Prevent user requesting more than max number of rows
          const number = decodeNumber(string);
          return number && Math.min(number, Math.max(...[10, 25, 50, 100]));
        },
      },
      50
    ),
    orderBy: withDefault(
      createEnumParam(
        // Same as filter then map but this is acceptable to typescript
        DEFAULT_FLOW_TABLE_HEADERS.reduce((acc, curr) => {
          if (curr.sortable) {
            return [...acc, curr.identifierID];
          }

          return acc;
        }, [] as string[])
      ),
      'flow.updatedAt'
    ),
    orderDir: withDefault(createEnumParam(['ASC', 'DESC']), 'DESC'),
    filters: withDefault(JsonParam, JSON.stringify({})),
    tableHeaders: withDefault(StringParam, encodeTableHeaders([])), // Default value of table headers
    prevPageCursor: withDefault(NumberParam, 0),
    nextPageCursor: withDefault(NumberParam, 0),
  });

  const handleAbortController = useCallback(() => {
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const pendingFlowsTableProps: FlowsTableProps = {
    headers: DEFAULT_FLOW_TABLE_HEADERS,
    initialValues: PENDING_FLOWS_FILTER_INITIAL_VALUES,
    rowsPerPageOption: [10, 25, 50, 100],
    query: query,
    setQuery: setQuery,
    pending: true,
    abortSignal: abortControllerRef.current.signal,
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <FilterPendingFlowsTable
              setQuery={setQuery}
              query={query}
              handleAbortController={handleAbortController}
            />
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.pendingFlows.title)}
              </C.PageTitle>
              <FlowsTable {...pendingFlowsTableProps} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
