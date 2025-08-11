import { C } from '@unocha/hpc-ui';
import React, { useContext } from 'react';
import { useParams } from 'react-router';
import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  element: React.ReactElement;
  routeParam: string;
  errorElement?: React.ReactElement;
}

export const RouteParamsValidator = (props: Props) => {
  const { element, routeParam, errorElement } = props;
  const { lang } = useContext(AppContext);

  const param = useParams()[routeParam];
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

  return element;
};
