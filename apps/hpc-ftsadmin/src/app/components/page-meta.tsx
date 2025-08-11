import { useHead } from '@unhead/react';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { t } from '../../i18n';
import { getContext } from '../context';

interface Props {
  children: React.ReactElement;
}

const head = createHead();

export const useTitle = (title: string[]) => {
  const { lang } = getContext();
  const titleSegments = [...title, t.t(lang, (s) => s.title)];

  return useHead({
    title: titleSegments.join(' - '),
  });
};

export const PageMeta = (props: Props) => (
  <UnheadProvider head={head}>{props.children}</UnheadProvider>
);

export default PageMeta;
