import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import FlowsTable, { FlowsTableProps } from '../components/flows-table';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import { useState } from 'react';
import FilterTable, { FormValues } from '../components/filter-table';

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
  const filtersInitialValues: FormValues = {
    flowId: '',
    amountUSD: '',
    keywords: [],
    flowStatus: '',
    flowType: '',
    flowActiveStatus: '',
    reporterReferenceCode: '',
    sourceSystemId: '',
    flowLegacyId: '',
    sourceOrganizations: [],
    sourceCountries: [],
    sourceUsageYears: [],
    sourceProjects: [],
    sourcePlans: [],
    sourceGlobalClusters: [],
    sourceEmergencies: [],
    destinationOrganizations: [],
    destinationCountries: [],
    destinationUsageYears: [],
    destinationProjects: [],
    destinationPlans: [],
    destinationGlobalClusters: [],
    destinationEmergencies: [],
    includeChildrenOfParkedFlows: true,
  };
  const [filters, setFilters] = useState<FormValues>(filtersInitialValues);

  const flowsTableProps: FlowsTableProps = {
    headers: [
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
    ],
    flowList: filters ? 'search' : 'all',
    filters: filters,
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
            <FilterTable environment={env} setFilters={setFilters} />
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
