import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import FlowsTableREST, {
  FlowsTableRESTProps,
} from '../../components/tables/flows-table-REST';
import PageMeta from '../../components/page-meta';
import { AppContext, getEnv } from '../../context';
import tw from 'twin.macro';
import FilterFlowsTableREST, {
  FLOWS_FILTER_INITIAL_VALUES_REST,
} from '../../components/filters/filter-flows-REST-table';
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
  const rowsPerPageOptions = [10, 25, 50, 100];

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 0),
    rowsPerPage: withDefault(
      {
        ...NumberParam,
        decode: (string) => {
          // prevent user requesting more than max number of rows
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
    filters: withDefault(JsonParam, JSON.stringify({})),
    tableHeaders: withDefault(StringParam, encodeTableHeaders([])), //  Default value of table headers
    prevPageCursor: withDefault(StringParam, ''),
    nextPageCursor: withDefault(StringParam, ''),
  });

  const flowsTableProps: FlowsTableRESTProps = {
    headers: DEFAULT_FLOW_TABLE_HEADERS,
    rowsPerPageOption: rowsPerPageOptions,
    initialValues: FLOWS_FILTER_INITIAL_VALUES_REST,
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
            <FilterFlowsTableREST
              environment={env}
              setQuery={setQuery}
              query={query}
              lang={lang}
            />
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.flows.title)}
              </C.PageTitle>
              <FlowsTableREST {...flowsTableProps} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
