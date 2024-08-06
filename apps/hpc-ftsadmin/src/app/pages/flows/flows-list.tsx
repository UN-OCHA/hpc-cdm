import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext } from '../../context';
import tw from 'twin.macro';

import {
  JsonParam,
  NumberParam,
  StringParam,
  createEnumParam,
  decodeNumber,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  encodeTableHeaders,
} from '../../utils/table-headers';
import FlowsTable, {
  FlowsTableProps,
} from '../../components/tables/flows-table';
import FilterFlowsTable, {
  FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-flows-table';

interface Props {
  className?: string;
}

const Container = tw.div`
  flex
`;
const LandingContainer = tw.div`
  w-full
  overflow-x-clip
  h-full
`;
export default (props: Props) => {
  const rowsPerPageOptions = [10, 25, 50, 100];

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 0),
    rowsPerPage: withDefault(
      {
        ...NumberParam,
        decode: (string) => {
          // Prevent user requesting more than max number of rows
          const number = decodeNumber(string);
          return number && Math.min(number, Math.max(...rowsPerPageOptions));
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
    filters: withDefault(
      JsonParam,
      JSON.stringify(FLOWS_FILTER_INITIAL_VALUES)
    ),
    tableHeaders: withDefault(StringParam, encodeTableHeaders([])), // Default value of table headers
    prevPageCursor: withDefault(NumberParam, undefined),
    nextPageCursor: withDefault(NumberParam, undefined),
  });

  const flowsTableProps: FlowsTableProps = {
    headers: DEFAULT_FLOW_TABLE_HEADERS,
    rowsPerPageOption: rowsPerPageOptions,
    initialValues: FLOWS_FILTER_INITIAL_VALUES,
    query: query,
    setQuery: setQuery,
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
