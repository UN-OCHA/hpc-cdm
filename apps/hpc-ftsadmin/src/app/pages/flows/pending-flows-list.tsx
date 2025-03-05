import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import FilterPendingFlowsTable, {
  PENDING_FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-pending-flows-table';
import PageMeta from '../../components/page-meta';
import FlowsTable, {
  type FlowsTableProps,
} from '../../components/tables/flows-table';
import { AppContext } from '../../context';
import { FLOW_PARAMS_CODEC } from '../../utils/codecs';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  encodeTableHeaders,
} from '../../utils/table-headers';
import useQueryParams from '../../utils/useQueryParams';

interface Props {
  className?: string;
}
const Container = tw.div`
  flex
`;
const LandingContainer = styled.div`
  height: calc(100vh - ${(p) => p.theme.sizing.totalHeaderHeight});
  ${tw`
    w-full
    overflow-x-clip
    flex
    flex-col
  `}
`;

export default (props: Props) => {
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

  const pendingFlowsTableProps: FlowsTableProps = {
    initialValues: PENDING_FLOWS_FILTER_INITIAL_VALUES,
    rowsPerPageOptions: [10, 25, 50, 100],
    query,
    setQuery,
    pending: true,
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <FilterPendingFlowsTable setQuery={setQuery} query={query} />
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
