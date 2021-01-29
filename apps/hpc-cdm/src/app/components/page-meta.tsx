import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';

import { AppContext } from '../context';
import { t } from '../../i18n';

interface Props {
  title?: string[];
}

export const PageMeta = (props: Props) => {
  const { title } = props;
  const { lang } = useContext(AppContext);
  const titleSegments = [...(title || []), t.t(lang, (s) => s.title)];
  return (
    <Helmet>
      <title>{titleSegments.join(' - ')}</title>
    </Helmet>
  );
};

export default PageMeta;
