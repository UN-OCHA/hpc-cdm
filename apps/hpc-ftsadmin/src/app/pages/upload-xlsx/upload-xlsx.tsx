import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import LinearProgressWithLabel from '../../components/linear-progress-with-label';
import { useTitle } from '../../components/page-meta';
import XLSXUploader from '../../components/xlsx-uploader';
import { getContext } from '../../context';
import { useJobTracking } from '../../hooks/useJobTracking';

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

  const { job, setPendingJobId } = useJobTracking('importExcelBridge');

  const [isUploadDisabled, setIsUploadDisabled] = useState(true);

  useEffect(() => {
    if (job) {
      setIsUploadDisabled(true);
    } else {
      setIsUploadDisabled(false);
    }
  }, [job]);

  return (
    <div className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}>
      <Container>
        <LandingContainer>
          <C.PageTitle>
            {t.t(lang, (s) => s.routes.uploadXLSX.title)}
          </C.PageTitle>
          <XLSXUploader
            onUploadStart={() => {
              setIsUploadDisabled(true);
            }}
            onSuccess={(jobId) => {
              setPendingJobId(jobId);
              setIsUploadDisabled(true);
            }}
            disabled={isUploadDisabled}
          />
          {job && (
            <LinearProgressWithLabel
              processed={job.metadata.processed}
              total={job.metadata.total}
              shouldShowProcess
            />
          )}
        </LandingContainer>
      </Container>
    </div>
  );
};
