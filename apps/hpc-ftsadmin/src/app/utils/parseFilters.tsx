import { categories, flows } from '@unocha/hpc-data';
import { FormValues } from '../components/filter-table';
import { ParsedFilters } from '../components/flows-table';
import { formValueToId, formValueToLabel } from './mapFunctions';
import { FORM_INITIAL_VALUES } from '../pages/flows-list';

export const parseFilters = (
  filters: FormValues
): ParsedFilters | undefined => {
  if (!filters) return;
  const typedFormFields: flows.FlowFilters = {
    flowId: filters.flowId,
    keywords: formValueToLabel(filters.keywords),
    amountUSD: filters.amountUSD === '' ? null : parseInt(filters.amountUSD),
    flowStatus: filters.flowStatus,
    flowType: filters.flowType,
    flowActiveStatus: filters.flowActiveStatus,
    reporterReferenceCode:
      filters.reporterReferenceCode === ''
        ? null
        : parseInt(filters.reporterReferenceCode),
    sourceSystemId:
      filters.sourceSystemId === '' ? null : parseInt(filters.sourceSystemId),
    flowLegacyId:
      filters.flowLegacyId === '' ? null : parseInt(filters.flowLegacyId),
    destinationCountries: formValueToId(filters.destinationCountries),
    destinationOrganizations: formValueToId(filters.destinationOrganizations),
    destinationProjects: formValueToId(filters.destinationProjects),
    destinationPlans: formValueToId(filters.destinationPlans),
    destinationGlobalClusters: formValueToId(filters.destinationGlobalClusters),
    destinationEmergencies: formValueToId(filters.destinationEmergencies),
    destinationUsageYears: formValueToId(filters.destinationUsageYears),
    sourceCountries: formValueToId(filters.sourceCountries),
    sourceOrganizations: formValueToId(filters.sourceOrganizations),
    sourceUsageYears: formValueToId(filters.sourceUsageYears),
    sourceProjects: formValueToId(filters.sourceProjects),
    sourcePlans: formValueToId(filters.sourcePlans),
    sourceGlobalClusters: formValueToId(filters.sourceGlobalClusters),
    sourceEmergencies: formValueToId(filters.sourceEmergencies),
    includeChildrenOfParkedFlows: filters.includeChildrenOfParkedFlows,
  };
  const {
    amountUSD,
    destinationCountries,
    destinationEmergencies,
    destinationGlobalClusters,
    destinationOrganizations,
    destinationPlans,
    destinationProjects,
    destinationUsageYears,
    flowActiveStatus,
    flowId,
    flowLegacyId,
    flowStatus,
    flowType,
    includeChildrenOfParkedFlows,
    keywords,
    reporterReferenceCode,
    sourceCountries,
    sourceEmergencies,
    sourceGlobalClusters,
    sourceOrganizations,
    sourcePlans,
    sourceProjects,
    sourceSystemId,
    sourceUsageYears,
  } = typedFormFields;

  const parsedKeywords: { values: string; group: 'keywords' }[] = keywords.map(
    (keyword) => {
      return { values: keyword, group: 'keywords' };
    }
  );
  const categories = parseCategories([
    ...parsedKeywords,
    { values: flowStatus, group: 'flowStatus' },
    { values: flowType, group: 'flowType' },
  ]);

  const flowObjects: flows.FlowObject[] = parseFlowObjects([
    {
      values: destinationCountries,
      refDirection: 'destination',
      objectType: 'location',
    },
    {
      values: destinationOrganizations,
      refDirection: 'destination',
      objectType: 'organization',
    },
    {
      values: destinationUsageYears,
      refDirection: 'destination',
      objectType: 'usageYear',
    },
    {
      values: destinationProjects,
      refDirection: 'destination',
      objectType: 'project',
    },
    {
      values: destinationPlans,
      refDirection: 'destination',
      objectType: 'plan',
    },
    {
      values: destinationGlobalClusters,
      refDirection: 'destination',
      objectType: 'globalCluster',
    },
    {
      values: destinationEmergencies,
      refDirection: 'destination',
      objectType: 'emergency',
    },
    {
      values: sourceCountries,
      refDirection: 'source',
      objectType: 'location',
    },
    {
      values: sourceOrganizations,
      refDirection: 'source',
      objectType: 'organization',
    },
    {
      values: sourceUsageYears,
      refDirection: 'source',
      objectType: 'usageYear',
    },
    {
      values: sourceProjects,
      refDirection: 'source',
      objectType: 'project',
    },
    {
      values: sourcePlans,
      refDirection: 'source',
      objectType: 'plan',
    },
    {
      values: sourceGlobalClusters,
      refDirection: 'source',
      objectType: 'globalCluster',
    },
    {
      values: sourceEmergencies,
      refDirection: 'source',
      objectType: 'emergency',
    },
  ]);

  return {
    ...(flowActiveStatus !== ''
      ? { activeStatus: { name: flowActiveStatus } }
      : {}),
    ...(flowId !== '' ? { flowID: parseInt(flowId) } : {}),
    ...(amountUSD !== null ? { amountUSD: amountUSD } : {}),
    ...(flowLegacyId !== null ? { legacyID: `${flowLegacyId}` } : {}),
    ...(reporterReferenceCode !== null
      ? { reporterRefCode: `${reporterReferenceCode}` }
      : {}),
    ...(sourceSystemId !== null ? { sourceSystemID: `${sourceSystemId}` } : {}),
    ...(categories.length > 0 ? { categories: categories } : {}),
    ...(flowObjects.length > 0 ? { flowObjects: flowObjects } : {}),
    includeChildrenOfParkedFlows,
  };
};

const parseCategories = (
  categories: {
    values: string | undefined;
    group: categories.CategoryGroup;
  }[]
) => {
  const res: { name: string; group: string }[] = [];
  categories.map((category) => {
    if (category.values) {
      res.push({ name: category.values, group: category.group });
    }
  });
  return res;
};

const parseFlowObjects = (
  flowObjects: {
    values: string[] | undefined;
    refDirection: 'source' | 'destination';
    objectType:
      | 'location'
      | 'organization'
      | 'usageYear'
      | 'project'
      | 'plan'
      | 'globalCluster'
      | 'emergency';
  }[]
): flows.FlowObject[] => {
  const res: flows.FlowObject[] = [];

  flowObjects.map((flows) => {
    if (flows.values) {
      res.push(
        ...flows.values.map((value) => ({
          objectID: parseInt(value),
          refDirection: flows.refDirection,
          objectType: flows.objectType,
        }))
      );
    }
  });
  return res;
};

export const encodeFilters = (filters: FormValues) => {
  return JSON.stringify(filters);
};

export const decodeFilters = (stringFilters: string): FormValues => {
  try {
    const res: FormValues = JSON.parse(stringFilters);
    return res;
  } catch (err) {
    console.error(
      err,
      '<||> Error parsing query to JSON. Reseting to initial Values...'
    );
    return FORM_INITIAL_VALUES;
  }
};
