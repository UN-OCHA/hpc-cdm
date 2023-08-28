import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import FlowsTable, { FlowsTableProps } from '../components/flows-table';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import { useState } from 'react';
import FilterTable from '../components/filter-table';
import { flows } from '@unocha/hpc-data';

interface Props {
  className?: string;
}

const Container = tw.div`
flex
`;

export default (props: Props) => {
  const [filters, setFilters] = useState<flows.SearchFlowsGraphQlParams>();
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
    flowList: 'all',
    filters: filters,
  };

  const [isOpen, setOpen] = useState(false);
  const env = getEnv();

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <FilterTable
              isOpen={isOpen}
              setOpen={setOpen}
              environment={env}
              setFilters={setFilters}
            />
            <div>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.flows.title)}
              </C.PageTitle>
              <C.Button
                color="primary"
                text="Filters"
                onClick={() => setOpen(!isOpen)}
              />
              <FlowsTable {...flowsTableProps} />
            </div>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
