import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import FlowsTable, {
  FlowsTableProps,
  HeaderID,
} from '../components/flows-table';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import { Strings } from '../../i18n/iface';
import {
  JsonParam,
  NumberParam,
  createEnumParam,
  decodeNumber,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { encodeFilters } from '../utils/parse-filters';
import FilterPendingFlowsTable, {
  PENDING_FLOWS_FILTER_INITIAL_VALUES,
} from '../components/filter-pending-flows-table';
import tw from 'twin.macro';

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
  const headers: {
    id: HeaderID;
    sortable?: boolean;
    label: keyof Strings['components']['flowsTable']['headers'];
  }[] = [
    {
      id: 'flow.id',
      sortable: true,
      label: 'id',
    },
    {
      id: 'flow.updatedAt',
      sortable: true,
      label: 'updatedCreated',
    },
    {
      id: 'externalReference.systemID',
      sortable: true,
      label: 'dataProvider',
    },
    {
      id: 'flow.amountUSD',
      sortable: true,
      label: 'amountUSD',
    },
    {
      id: 'source.organization.name',
      sortable: true,
      label: 'sourceOrganization',
    },
    {
      id: 'destination.organization.name',
      sortable: true,
      label: 'destinationOrganization',
    },
    {
      id: 'destination.planVersion.name',
      sortable: true,
      label: 'destinationPlan',
    },
    {
      id: 'destination.location.name',
      sortable: true,
      label: 'destinationCountry',
    },
    {
      id: 'destination.usageYear.year',
      sortable: true,
      label: 'destinationYear',
    },
    {
      id: 'details',
      label: 'details',
    },
  ];
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
        headers.reduce((acc, curr) => {
          if (curr.sortable) {
            return [...acc, curr.id];
          }

          return acc;
        }, [] as string[])
      ),
      'flow.updatedAt'
    ),
    orderDir: withDefault(createEnumParam(['ASC', 'DESC']), 'DESC'),
    filters: withDefault(
      JsonParam,
      encodeFilters(PENDING_FLOWS_FILTER_INITIAL_VALUES)
    ),
  });

  const flowsTableProps: FlowsTableProps = {
    headers: headers,
    flowList: 'pending',
    initialValues: PENDING_FLOWS_FILTER_INITIAL_VALUES,
    rowsPerPageOption: [10, 25, 50, 100],
    query: query,
    setQuery: setQuery,
  };

  const env = getEnv();

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <FilterPendingFlowsTable
              environment={env}
              setQuery={setQuery}
              query={query}
            />
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.pendingFlows.title)}
              </C.PageTitle>
              <FlowsTable {...flowsTableProps} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
