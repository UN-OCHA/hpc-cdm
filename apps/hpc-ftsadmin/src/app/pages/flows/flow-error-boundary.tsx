import { t } from '../../../i18n';
import { getContext } from '../../context';
import { ErrorBoundary } from '../../error';
import paths from '../../paths';

export const FlowErrorBoundary = () => {
  const { lang } = getContext();

  return (
    <ErrorBoundary
      text={t.t(lang, (s) => s.errors.unexpectedFlowError.text)}
      buttonProps={{
        text: t.t(lang, (s) => s.errors.unexpectedFlowError.button),
        href: paths.home(),
      }}
    />
  );
};
