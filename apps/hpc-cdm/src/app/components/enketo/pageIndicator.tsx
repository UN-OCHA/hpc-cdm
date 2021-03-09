import React, { useContext } from 'react';
import { styled } from '@unocha/hpc-ui';

import { PageInfo } from './xform';
import { t } from '../../../i18n';
import { AppContext } from '../../context';

interface Props {
  pageInfo: PageInfo | null;
}

const Container = styled.div`
  text-align: center;
  font-weight: bold;
  margin-bottom: ${(p) => p.theme.marginPx.md}px;
`;

const PageIndicator = ({ pageInfo }: Props) => {
  const { lang } = useContext(AppContext);
  return (
    pageInfo && (
      <Container>
        {t.t(lang, (s) => s.routes.operations.forms.pageIndicator, {
          page: (pageInfo.currentPage || 0) + 1,
          count: pageInfo.totalPages,
        })}
      </Container>
    )
  );
};

export default PageIndicator;
