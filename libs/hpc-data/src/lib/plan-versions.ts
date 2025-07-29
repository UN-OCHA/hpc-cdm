import * as t from 'io-ts';
import { DATE_FROM_STRING, ISO_DATE_FROM_STRING, optional } from './util';

const PLAN_VISIBILITY_PREFERENCES = t.type({
  isDisaggregationForCaseloads: t.boolean,
  isDisaggregationForIndicators: t.boolean,
  isForNewHPCProjects: t.boolean,
});

const PLAN_VERSION_CLUSTER_SELECTION_TYPE = t.keyof({
  single: null,
  multi: null,
});

export const PLAN_VERSION = t.type({
  id: t.number,
  planId: t.number,
  name: t.string,
  startDate: ISO_DATE_FROM_STRING,
  endDate: ISO_DATE_FROM_STRING,
  isForHPCProjects: t.boolean,
  isPartOfGHO: t.boolean,
  visibilityPreferences: PLAN_VISIBILITY_PREFERENCES,
  currentVersion: t.boolean,
  latestVersion: t.boolean,
  latestTaggedVersion: t.boolean,
  createdAt: DATE_FROM_STRING,
  updatedAt: DATE_FROM_STRING,
  shortName: optional(t.string),
  subtitle: optional(t.string),
  comments: optional(t.string),
  code: optional(t.string),
  customLocationCode: optional(t.string),
  currentReportingPeriodId: optional(t.number),
  lastPublishedReportingPeriodId: optional(t.number),
  clusterSelectionType: optional(PLAN_VERSION_CLUSTER_SELECTION_TYPE),
  pdfPublishDate: optional(ISO_DATE_FROM_STRING),
  focusLocationId: optional(t.number),
  versionTags: optional(t.array(t.string)),
});
