import * as t from 'io-ts';
import { DATE_FROM_STRING } from './util';

export const IMPORT_EXCEL_BRIDGE_METADATA = t.type({
  fileName: t.string,
  startedBy: t.number,
  total: t.number,
  processed: t.number,
  failures: t.array(t.string),
  totalCreated: t.number,
  totalSkipped: t.number,
});

export type ImportExcelBridgeMetadata = t.TypeOf<
  typeof IMPORT_EXCEL_BRIDGE_METADATA
>;

/**
 * An object representing the global permissions the current user has
 */
export const JOB = t.intersection([
  t.type({
    id: t.number,
    startAt: DATE_FROM_STRING,
    status: t.union([
      t.literal('pending'),
      t.literal('success'),
      t.literal('failed'),
    ]),
    endAt: t.union([DATE_FROM_STRING, t.null]),
    totalTaskCount: t.union([t.number, t.null]),
  }),
  t.union([
    t.type({
      type: t.union([
        t.literal('confirmableCommand'),
        t.literal('locationImport'),
        t.literal('projectExcelGeneration'),
        t.literal('projectPdfGeneration'),
      ]),
      metadata: t.unknown,
    }),
    t.type({
      type: t.literal('importExcelBridge'),
      metadata: IMPORT_EXCEL_BRIDGE_METADATA,
    }),
  ]),
]);

export const GET_PENDING_JOBS_RESULT = t.array(JOB, 'GET_PENDING_JOBS_RESULT');

export type GetPendingJobsResult = t.TypeOf<typeof GET_PENDING_JOBS_RESULT>;

export type Job = t.TypeOf<typeof JOB>;

export type JobType = Job['type'];

export interface Model {
  /**
   * Get all pending jobs
   * @returns All pending jobs
   */
  getPendingJobs(type?: JobType): Promise<GetPendingJobsResult>;

  /**
   * Get a job by its ID
   * @param id - The ID of the job to get
   * @returns The job
   */
  getJobById(id: number): Promise<Job>;
}
