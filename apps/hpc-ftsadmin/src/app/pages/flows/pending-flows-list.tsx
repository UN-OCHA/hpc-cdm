import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext } from '../../context';
import FilterPendingFlowsTable, {
  PENDING_FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-pending-flows-table';
import tw from 'twin.macro';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  encodeTableHeaders,
} from '../../utils/table-headers';
import FlowsTable, {
  type FlowsTableProps,
} from '../../components/tables/flows-table';
import { useCallback, useEffect, useRef } from 'react';
import useQueryParams from '../../utils/useQueryParams';
import { FLOW_PARAMS_CODEC } from '../../utils/codecs';

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
    codec: FLOW_PARAMS_CODEC,
    initialValues: {
      page: 0,
      rowsPerPage: 50,
      orderBy: 'flow.updatedAt',
      orderDir: 'DESC',
      filters: JSON.stringify({}),
      tableHeaders: encodeTableHeaders([]), // Default value of table headers
    },
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
    query,
    setQuery,
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
