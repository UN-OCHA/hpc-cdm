import { C } from '@unocha/hpc-ui';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  element: JSX.Element;
  routeParams: string[];
  errorElement?: JSX.Element;
}

export const RouteParamsValidator = (props: Props) => {
  const { element, routeParams, errorElement } = props;
  const { lang } = useContext(AppContext);

  const params = useParams();

  for (const routeParam of routeParams) {
    const param = params[routeParam];
    const numericParam = parseFloat(param ?? '');
    if (!Number.isInteger(numericParam)) {
      return (
        errorElement ?? (
          <C.NotFound
            strings={t.get(lang, (s) => s.components.invalidRouteParam)}
          />
        )
      );
    }
  }

  return element;
};
