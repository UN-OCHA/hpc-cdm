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

const StatsTable = styled.table`
  ${tw`
    mt-6
    w-full
    max-w-md
    border-collapse
    rounded-lg
    overflow-hidden
    shadow-sm
  `}

  th {
    ${tw`
      bg-unocha-pallete-blue-dark2
      text-white
      font-semibold
      text-left
      px-6
      py-3
      text-sm
      uppercase
      tracking-wider
    `}
  }

  td {
    ${tw`
      px-6
      py-4
      text-sm
      border-t
      border-gray-200
    `}
  }

  tbody tr {
    ${tw`
      bg-white
      hover:bg-gray-50
      transition-colors
    `}
  }

  td:first-child {
    ${tw`
      font-medium
      text-gray-900
    `}
  }

  td:last-child {
    ${tw`
      text-right
      font-semibold
      text-unocha-pallete-blue
    `}
  }
`;

const Stats = ({
  totalCreated,
  totalSkipped,
}: {
  totalCreated: number;
  totalSkipped: number;
}) => {
  const { lang } = getContext();

  return (
    <StatsTable>
      <thead>
        <tr>
          <th>{t.t(lang, (s) => s.components.xlsxUpload.stats.action)}</th>
          <th>{t.t(lang, (s) => s.components.xlsxUpload.stats.count)}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{t.t(lang, (s) => s.components.xlsxUpload.stats.created)}</td>
          <td>{totalCreated}</td>
        </tr>
        <tr>
          <td>{t.t(lang, (s) => s.components.xlsxUpload.stats.skipped)}</td>
          <td>{totalSkipped}</td>
        </tr>
      </tbody>
    </StatsTable>
  );
};

export default (props: Props) => {
  const { lang } = getContext();

  useTitle([t.t(lang, (s) => s.routes.uploadXLSX.title)]);

  const [isUploadDisabled, setIsUploadDisabled] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[] | null>(null);
  const [stats, setStats] = useState<{
    totalCreated: number;
    totalSkipped: number;
  } | null>(null);

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
        setStats(job.metadata);
      } else if (job.status === 'failed') {
        if (job.metadata.failures && job.metadata.failures.length > 0) {
          setErrorMessages(job.metadata.failures);
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
            errorMessages={errorMessages}
            setErrorMessages={setErrorMessages}
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
          {stats && <Stats {...stats} />}
        </LandingContainer>
      </Container>
    </div>
  );
};
