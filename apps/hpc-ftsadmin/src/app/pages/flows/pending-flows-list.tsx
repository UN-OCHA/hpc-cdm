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
import { useCallback, useEffect, useState } from 'react';

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
  const [abortController, setAbortController] = useState<AbortController>(
    new AbortController()
  );

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 0),
    rowsPerPage: withDefault(
      {
        ...NumberParam,
        decode: (string) => {
          // prevent user requesting more than max number of rows
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
    tableHeaders: withDefault(StringParam, encodeTableHeaders([])), //  Default value of table headers
    prevPageCursor: withDefault(NumberParam, 0),
    nextPageCursor: withDefault(NumberParam, 0),
  });

  const handleAbortController = useCallback(() => {
    // Abort the ongoing requests
    abortController.abort();

    // Create a new AbortController for the next requests
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    // Perform actions with the updated filter values

    // Pass the new AbortSignal to FlowsTableGraphQL
    // This can be part of your state or directly passed as a prop
  }, [abortController]);

  useEffect(() => {
    return () => {
      handleAbortController();
    };
  }, []);

  const pendingFlowsTableProps: FlowsTableProps = {
    headers: DEFAULT_FLOW_TABLE_HEADERS,
    initialValues: PENDING_FLOWS_FILTER_INITIAL_VALUES,
    rowsPerPageOption: [10, 25, 50, 100],
    query: query,
    setQuery: setQuery,
    pending: true,
    abortSignal: abortController.signal,
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
