import { CLASSES, combineClasses } from '@unocha/hpc-ui';

import FormNewEditFlow from '../components/form-new-edit-flow';
import { AppContext } from '../context';

interface Props {
  className?: string;
}

export default (props: Props) => (
  <AppContext.Consumer>
    {({ lang }) => (
      <div className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}>
        <FormNewEditFlow />
      </div>
    )}
  </AppContext.Consumer>
);
