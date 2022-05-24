import { C, CLASSES, combineClasses, dataLoader } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';

interface Props {
  className?: string;
}

export default (props: Props) => {
  const loader = dataLoader([], getEnv().model.operations.getOperations);

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(
            CLASSES.CONTAINER.CENTERED,
            props.className
          )}
        >
          <PageMeta title={[t.t(lang, (s) => s.navigation.flows)]} />
          <C.Loader
            loader={loader}
            strings={{
              ...t.get(lang, (s) => s.components.loader),
              notFound: t.get(lang, (s) => s.components.notFound),
            }}
          >
            {(data) => (
              <>
                <C.PageTitle>
                  {t.t(lang, (s) => s.navigation.flows)}
                </C.PageTitle>
                <div>Hello world</div>
              </>
            )}
          </C.Loader>
        </div>
      )}
    </AppContext.Consumer>
  );
};
