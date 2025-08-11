import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import FilterPendingFlowsTable, {
  PENDING_FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-pending-flows-table';
import { useTitle } from '../../components/page-meta';
import FlowsTable, {
  type FlowsTableProps,
} from '../../components/tables/flows-table';
import { getContext } from '../../context';
import { FLOW_PARAMS_CODEC } from '../../utils/codecs';
import { ROWS_PER_PAGE_OPTIONS } from '../../utils/constants';
import { encodeTableHeaders } from '../../utils/table-headers';
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
  const { lang } = getContext();
  const [query, setQuery] = useQueryParams({
    codec: FLOW_PARAMS_CODEC,
    initialValues: {
      page: 0,
      rowsPerPage: 50,
      orderBy: 'flow.updatedAt',
      orderDir: 'DESC',
      filters: JSON.stringify({}),
      tableHeaders: encodeTableHeaders({
        headers: [],
        table: 'flows',
        isPending: true,
      }), // Default value of table headers
    },
  });

  const pendingFlowsTableProps: FlowsTableProps = {
    initialValues: PENDING_FLOWS_FILTER_INITIAL_VALUES,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
    query,
    setQuery,
    isPending: true,
  };

  useTitle([t.t(lang, (s) => s.routes.pendingFlows.title)]);

  return (
    <div className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}>
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
  );
};
