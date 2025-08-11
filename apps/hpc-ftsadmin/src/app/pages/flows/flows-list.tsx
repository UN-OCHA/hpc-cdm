import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import FilterFlowsTable, {
  FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-flows-table';
import { useTitle } from '../../components/page-meta';
import FlowsTable, {
  type FlowsTableProps,
} from '../../components/tables/flows-table';
import { getContext } from '../../context';
import { FLOW_PARAMS_CODEC } from '../../utils/codecs';
import { ROWS_PER_PAGE_OPTIONS, TOAST_CONFIG } from '../../utils/constants';
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
  const state: { successMessage?: string } | undefined = useLocation().state;
  const { lang } = getContext();

  const [query, setQuery] = useQueryParams({
    codec: FLOW_PARAMS_CODEC,
    initialValues: {
      page: 0,
      rowsPerPage: 50,
      orderBy: 'flow.updatedAt',
      orderDir: 'DESC',
      filters: JSON.stringify({}),
      tableHeaders: encodeTableHeaders({ headers: [], table: 'flows' }), // Default value of table headers
    },
  });

  const flowsTableProps: FlowsTableProps = {
    rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
    initialValues: FLOWS_FILTER_INITIAL_VALUES,
    query,
    setQuery,
  };

  useEffect(() => {
    if (state?.successMessage) {
      toast.success(state.successMessage, TOAST_CONFIG);
    }
  }, [state?.successMessage]);
  useTitle([t.t(lang, (s) => s.routes.flows.title)]);

  return (
    <div className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}>
      <Container>
        <FilterFlowsTable setQuery={setQuery} query={query} />
        <LandingContainer>
          <C.PageTitle>{t.t(lang, (s) => s.routes.flows.title)}</C.PageTitle>
          <FlowsTable {...flowsTableProps} />
        </LandingContainer>
      </Container>
    </div>
  );
};
