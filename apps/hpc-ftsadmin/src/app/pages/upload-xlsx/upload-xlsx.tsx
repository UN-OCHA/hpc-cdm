import { C, CLASSES, combineClasses, styled } from '@unocha/hpc-ui';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import LinearProgressWithLabel from '../../components/linear-progress-with-label';
import { useTitle } from '../../components/page-meta';
import XLSXUploader from '../../components/xlsx-uploader';
import { getContext } from '../../context';
import { useJobTracking } from '../../hooks/useJobTracking';
import { TOAST_CONFIG, TOAST_CONFIG_ERROR } from '../../utils/constants';

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

  const [isUploadDisabled, setIsUploadDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { job, setPendingJobId } = useJobTracking({
    jobType: 'importExcelBridge',
    onBeforeClearJob: (job) => {
      if (job.status === 'success') {
        toast.success(
          t.t(lang, (s) => s.components.xlsxUpload.success, {
            fileName: job.metadata.fileName,
          }),
          TOAST_CONFIG
        );
        setPendingJobId(null);
      } else if (job.status === 'failed') {
        const jobErrorMessage = job.metadata.failures.at(0);

        if (jobErrorMessage) {
          setErrorMessage(jobErrorMessage);
          setIsUploadDisabled(false);
          return;
        }

        toast.error(
          t.t(lang, (s) => s.components.upload.error.unknown),
          TOAST_CONFIG_ERROR
        );
      }
      setIsUploadDisabled(false);
    },
  });

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
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
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
              title={job.metadata.fileName}
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
