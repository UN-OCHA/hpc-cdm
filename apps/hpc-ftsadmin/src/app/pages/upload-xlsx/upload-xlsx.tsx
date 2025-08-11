import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import { useTitle } from '../../components/page-meta';
import XLSXUploader from '../../components/xlsx-uploader';
import { getContext } from '../../context';

type Props = {
  className?: string;
};

const Container = tw.div`
  flex
`;
const LandingContainer = styled.div`
  height: calc(100vh - ${(p) => p.theme.sizing.totalHeaderHeight});
  ${tw`
    w-full
    overflow-x-clip
    flex
    flex-col
  `}
`;

export default (props: Props) => {
  const { lang } = getContext();

  useTitle([t.t(lang, (s) => s.routes.uploadXLSX.title)]);

  return (
    <div className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}>
      <Container>
        <LandingContainer>
          <C.PageTitle>
            {t.t(lang, (s) => s.routes.uploadXLSX.title)}
          </C.PageTitle>
          <XLSXUploader />
        </LandingContainer>
      </Container>
    </div>
  );
};
