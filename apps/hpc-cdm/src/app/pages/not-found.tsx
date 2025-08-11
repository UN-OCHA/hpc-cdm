import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { useTitle } from '../components/page-meta';
import { getContext } from '../context';

interface Props {
  className?: string;
}

const PageNotFound = (props: Props) => {
  const { lang } = getContext();

  useTitle([t.t(lang, (s) => s.components.notFound.title)]);

  return (
    <div
      className={combineClasses(CLASSES.CONTAINER.CENTERED, props.className)}
    >
      <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
    </div>
  );
};

export default styled(PageNotFound)`
  padding-bottom: 40px;
`;
