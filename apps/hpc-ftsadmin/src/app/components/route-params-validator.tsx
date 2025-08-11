import { C } from '@unocha/hpc-ui';
import React, { useContext } from 'react';
import { useParams } from 'react-router';
import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  element: React.ReactElement;
  routeParams: string[];
  errorElement?: React.ReactElement;
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
