import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext } from '../../context';
import XLSXUploader from '../../components/xlsx-uploader';

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
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.uploadXLSX.title)}
              </C.PageTitle>
              <XLSXUploader />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
