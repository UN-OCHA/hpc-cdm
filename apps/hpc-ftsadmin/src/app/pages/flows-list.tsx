import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import FlowsTable from '../components/flows-table';
import PageMeta from '../components/page-meta';
import { AppContext } from '../context';

interface Props {
  className?: string;
}

export default (props: Props) => {
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <C.PageTitle>{t.t(lang, (s) => s.routes.flows.title)}</C.PageTitle>
          <FlowsTable />
        </div>
      )}
    </AppContext.Consumer>
  );
};
