import { flows } from '@unocha/hpc-data';
import { CLASSES, combineClasses } from '@unocha/hpc-ui';

import FormNewEditFlow from '../components/form-new-edit-flow';

interface Props {
  className?: string;
  flow: flows.Flow;
}

export default (props: Props) => {
  const { flow } = props;
  return (
    <div
      className={combineClasses(CLASSES.CONTAINER.CENTERED, props.className)}
    >
      <FormNewEditFlow existing={flow} />
    </div>
  );
};
