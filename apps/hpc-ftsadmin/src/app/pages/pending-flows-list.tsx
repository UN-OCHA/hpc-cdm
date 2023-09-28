import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import FlowsTable, {
  FlowsTableProps,
  HeaderId,
} from '../components/flows-table';
import PageMeta from '../components/page-meta';
import { AppContext } from '../context';
import { flows } from '@unocha/hpc-data';
import { Strings } from '../../i18n/iface';

interface Props {
  className?: string;
}
interface FlowsTableNoFilterProps {
  headers: {
    id: HeaderId;
    sortable?: boolean;
    label: keyof Strings['components']['flowsTable']['headers'];
  }[];
  flowList: flows.FlowList;
}

export default (props: Props) => {
  const flowsTableProps: FlowsTableNoFilterProps = {
    headers: [
      {
        id: 'flow.id',
        sortable: true,
        label: 'id',
      },
      {
        id: 'flow.versionID',
        sortable: true,
        label: 'status',
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
    flowList: 'pending',
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.pendingFlows.title)]} />
          <C.PageTitle>
            {t.t(lang, (s) => s.routes.pendingFlows.title)}
          </C.PageTitle>
          <FlowsTable {...flowsTableProps} />
        </div>
      )}
    </AppContext.Consumer>
  );
};
