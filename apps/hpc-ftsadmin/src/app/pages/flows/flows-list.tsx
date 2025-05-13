import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import FilterFlowsTable, {
  FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-flows-table';
import PageMeta from '../../components/page-meta';
import FlowsTable, {
  type FlowsTableProps,
} from '../../components/tables/flows-table';
import { AppContext } from '../../context';
import { FLOW_PARAMS_CODEC } from '../../utils/codecs';
import { TOAST_CONFIG } from '../../utils/constants';
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
  const rowsPerPageOptions = [10, 25, 50, 100];

  const state: { successMessage?: string } | undefined = useLocation().state;

  useEffect(() => {
    if (state?.successMessage) {
      toast.success(state.successMessage, TOAST_CONFIG);
    }
  }, [state?.successMessage]);

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
    rowsPerPageOptions,
    initialValues: FLOWS_FILTER_INITIAL_VALUES,
    query,
    setQuery,
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <FilterFlowsTable setQuery={setQuery} query={query} />
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.flows.title)}
              </C.PageTitle>
              <FlowsTable {...flowsTableProps} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
