import type { jobs } from '@unocha/hpc-data';
import { useDataLoader } from '@unocha/hpc-ui';
import { useEffect, useState } from 'react';
import { getContext } from '../context';

type JobOfType<TJobType extends jobs.JobType> = Extract<
  jobs.Job,
  { type: TJobType }
>;

export const useJobTracking = <TJobType extends jobs.JobType>(
  jobType: TJobType,
  interval?: number
): {
  job: JobOfType<TJobType> | null;
  setPendingJobId: (jobId: number | null) => void;
} => {
  const { env } = getContext();
  const environment = env();
  const getJobById = environment.model.jobs.getJobById;
  const getPendingJobs = environment.model.jobs.getPendingJobs;

  const [pendingJobId, setPendingJobId] = useState<number | null>(null);
  const [job, setJob] = useState<JobOfType<TJobType> | null>(null);

  const [pendingJobs] = useDataLoader([], () => getPendingJobs(jobType));

  // Monitor for existing pending jobs on component mount
  useEffect(() => {
    if (pendingJobs.type === 'success') {
      const pendingJob = pendingJobs.data.at(0);
      if (pendingJob) {
        setPendingJobId(pendingJob.id);
        setJob(pendingJob as JobOfType<TJobType>);
      }
    }
  }, [pendingJobs]);

  // Poll job status when we have a pending job ID
  useEffect(() => {
    const fetchJob = async (jobId: number, intervalId: NodeJS.Timeout) => {
      const job = await getJobById(jobId);
      if (job && job.type === jobType) {
        setJob(job as JobOfType<TJobType>);

        if (job.status === 'success' || job.status === 'failed') {
          clearInterval(intervalId);
          setPendingJobId(null);
          setJob(null);
        }
      }
    };

    if (pendingJobId) {
      const intervalId = setInterval(async () => {
        await fetchJob(pendingJobId, intervalId);
      }, interval ?? 5000);

      return () => clearInterval(intervalId);
    }
  }, [pendingJobId, getJobById, jobType, interval]);

  return {
    job,
    setPendingJobId,
  };
};
