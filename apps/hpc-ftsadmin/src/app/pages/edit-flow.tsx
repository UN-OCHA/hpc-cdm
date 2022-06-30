import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';

import FormNewEditFlow from '../components/form-new-edit-flow';
import { AppContext } from '../context';

interface Props {
  className?: string;
}

export default (props: Props) => (
  <AppContext.Consumer>
    {({ lang }) => (
      <div
        className={combineClasses(CLASSES.CONTAINER.CENTERED, props.className)}
      >
        <C.PageTitle>{t.t(lang, (s) => s.routes.editFlow.title)}</C.PageTitle>
        <FormNewEditFlow />
      </div>
    )}
  </AppContext.Consumer>
);
