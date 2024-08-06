import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext, getEnv } from '../../context';
import tw from 'twin.macro';
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
import useQueryParams from '../../utils/useQueryParams';
import { ORGANIZATION_PARAMS_CODEC } from '../../utils/codecs';
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
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [abortController, setAbortController] = useState<AbortController>(
    new AbortController()
  );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [query, setQuery] = useQueryParams({
    codec: ORGANIZATION_PARAMS_CODEC,
    initialValues: {
      page: 0,
      rowsPerPage: 50,
      orderBy: 'organization.name',
      orderDir: 'ASC',
      filters: JSON.stringify({}),
      tableHeaders: encodeTableHeaders([], 'organizations'),
    },
  });

  const organizationTableProps: OrganizationTableProps = {
    headers: DEFAULT_ORGANIZATION_TABLE_HEADERS,
    rowsPerPageOption: rowsPerPageOptions,
    initialValues: ORGANIZATIONS_FILTER_INITIAL_VALUES,
    query: query,
    setQuery: setQuery,
    abortSignal: abortController.signal,
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
              handleAbortController={handleAbortController}
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
