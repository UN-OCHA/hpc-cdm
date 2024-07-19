import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext, getEnv } from '../../context';
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
  DEFAULT_ORGANIZATION_TABLE_HEADERS,
  encodeTableHeaders,
} from '../../utils/table-headers';
import OrganizationTable, {
  OrganizationTableProps,
} from '../../components/tables/organizations-table';
import FilterOrganizationsTable, {
  ORGANIZATIONS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-organization-table';

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
        DEFAULT_ORGANIZATION_TABLE_HEADERS.reduce((acc, curr) => {
          if (curr.sortable) {
            return [...acc, curr.identifierID];
          }

          return acc;
        }, [] as string[])
      ),
      'organization.name'
    ),
    orderDir: withDefault(createEnumParam(['ASC', 'DESC']), 'ASC'),
    filters: withDefault(JsonParam, JSON.stringify({})),
    tableHeaders: withDefault(
      StringParam,
      encodeTableHeaders([], 'organizations')
    ),
    prevPageCursor: withDefault(NumberParam, 0),
    nextPageCursor: withDefault(NumberParam, 0),
  });

  const organizationTableProps: OrganizationTableProps = {
    headers: DEFAULT_ORGANIZATION_TABLE_HEADERS,
    rowsPerPageOption: rowsPerPageOptions,
    initialValues: ORGANIZATIONS_FILTER_INITIAL_VALUES,
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
            <FilterOrganizationsTable
              environment={env}
              setQuery={setQuery}
              query={query}
              lang={lang}
            />
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.organizations.title)}
              </C.PageTitle>
              <OrganizationTable {...organizationTableProps} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
