import { categories, flows } from '@unocha/hpc-data';
import { FlowsFilterValues } from '../components/filter-flows-table';
import { ActiveFilter, ParsedFilters } from '../components/flows-table';
import { formValueToID, formValueToLabel } from './map-functions';
import { PendingFlowsFilterValues } from '../components/filter-pending-flows-table';
import { Strings } from '../../i18n/iface';

export const MAP_FILTER_VALUES_TO_I18: Record<
  keyof FlowsFilterValues | keyof PendingFlowsFilterValues,
  keyof Strings['components']['flowsFilter']['filters']
> = {
  amountUSD: 'amountUSD',
  destinationCountries: 'countries',
  destinationEmergencies: 'emergencies',
  destinationGlobalClusters: 'globalClusters',
  destinationOrganizations: 'organizations',
  destinationPlans: 'plans',
  destinationProjects: 'projects',
  destinationUsageYears: 'usageYears',
  sourceCountries: 'countries',
  sourceEmergencies: 'emergencies',
  sourceGlobalClusters: 'globalClusters',
  sourceOrganizations: 'organizations',
  sourcePlans: 'plans',
  sourceProjects: 'projects',
  sourceUsageYears: 'usageYears',
  flowActiveStatus: 'flowActiveStatus',
  dataProvider: 'dataProvider',
  flowID: 'flowID',
  flowLegacyID: 'flowLegacyID',
  flowStatus: 'flowStatus',
  flowType: 'flowType',
  includeChildrenOfParkedFlows: 'includeChildrenParkedFlows',
  keywords: 'keywords',
  reporterRefCode: 'reporterReferenceCode',
  sourceSystemID: 'sourceSystemID',
  status: 'status',
};

export const parseFilters = (
  filters: FlowsFilterValues | PendingFlowsFilterValues
): ParsedFilters | undefined => {
  if (!filters) return;

  const res: ParsedFilters = {};
  const typedFormFields: flows.FlowFilters = {};

  let key: keyof typeof filters;
  for (key in filters) {
    if (key.includes('destination') || key.includes('source')) {
      typedFormFields[key] = formValueToID(
        filters[key] as { label: string; id: string }[]
      ) as any;
    } else if (['flowID', 'amountUSD'].includes(key)) {
      const value = parseInt(filters[key] as string) as any;
      typedFormFields[key] = value;
      res[key as keyof ParsedFilters] = value;
    } else if ((key as keyof FlowsFilterValues) === 'keywords') {
      typedFormFields.keywords = formValueToLabel(
        filters[key] as { label: string; id: string }[]
      );
    } else if ((key as keyof PendingFlowsFilterValues) === 'status') {
      res.status = { status: filters[key] as string };
    } else {
      typedFormFields[key] = filters[key] as any;
      if ((key as keyof FlowsFilterValues) === 'flowActiveStatus') {
        res.flowActiveStatus = {
          activeStatus: { name: filters[key] as string },
        };
      } else if ((key as keyof PendingFlowsFilterValues) === 'dataProvider') {
        res.dataProvider = { systemID: filters[key] as string };
      } else {
        res[key as keyof ParsedFilters] = filters[key] as any;
      }
    }
  }

  const parsedKeywords: { values: string; group: 'keywords' }[] | undefined =
    typedFormFields.keywords?.map((keyword) => {
      return { values: keyword, group: 'keywords' };
    });
  let categoriesList: {
    values: string | undefined;
    group: categories.CategoryGroup;
  }[] = [
    { values: typedFormFields.flowStatus, group: 'flowStatus' },
    { values: typedFormFields.flowType, group: 'flowType' },
  ];
  if (parsedKeywords) categoriesList = [...categoriesList, ...parsedKeywords];
  res.categories = parseCategories(categoriesList);
  res.flowObjects = parseFlowObjects([
    {
      values: typedFormFields.destinationCountries,
      refDirection: 'destination',
      objectType: 'location',
    },
    {
      values: typedFormFields.destinationOrganizations,
      refDirection: 'destination',
      objectType: 'organization',
    },
    {
      values: typedFormFields.destinationUsageYears,
      refDirection: 'destination',
      objectType: 'usageYear',
    },
    {
      values: typedFormFields.destinationProjects,
      refDirection: 'destination',
      objectType: 'project',
    },
    {
      values: typedFormFields.destinationPlans,
      refDirection: 'destination',
      objectType: 'plan',
    },
    {
      values: typedFormFields.destinationGlobalClusters,
      refDirection: 'destination',
      objectType: 'globalCluster',
    },
    {
      values: typedFormFields.destinationEmergencies,
      refDirection: 'destination',
      objectType: 'emergency',
    },
    {
      values: typedFormFields.sourceCountries,
      refDirection: 'source',
      objectType: 'location',
    },
    {
      values: typedFormFields.sourceOrganizations,
      refDirection: 'source',
      objectType: 'organization',
    },
    {
      values: typedFormFields.sourceUsageYears,
      refDirection: 'source',
      objectType: 'usageYear',
    },
    {
      values: typedFormFields.sourceProjects,
      refDirection: 'source',
      objectType: 'project',
    },
    {
      values: typedFormFields.sourcePlans,
      refDirection: 'source',
      objectType: 'plan',
    },
    {
      values: typedFormFields.sourceGlobalClusters,
      refDirection: 'source',
      objectType: 'globalCluster',
    },
    {
      values: typedFormFields.sourceEmergencies,
      refDirection: 'source',
      objectType: 'emergency',
    },
  ]);

  return res;
};

const parseCategories = (
  categories:
    | {
        values: string | undefined;
        group: categories.CategoryGroup;
      }[]
    | undefined
) => {
  if (categories) {
    const res: { name: string; group: string }[] = [];
    categories.map((category) => {
      if (category.values) {
        res.push({ name: category.values, group: category.group });
      }
    });
    return res;
  }
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

export const encodeFilters = (
  filters: FlowsFilterValues | PendingFlowsFilterValues
) => {
  return JSON.stringify(filters);
};

export const decodeFilters = (
  stringFilters: string,
  initialValues: FlowsFilterValues | PendingFlowsFilterValues
): FlowsFilterValues => {
  try {
    const res: FlowsFilterValues = JSON.parse(stringFilters);
    return res;
  } catch (err) {
    console.warn(
      err,
      '<||> Error parsing query to JSON. Reseting to initial Values...'
    );
    return initialValues;
  }
};

export const parseActiveFilters = (
  filters: FlowsFilterValues | PendingFlowsFilterValues
) => {
  const attributes: ActiveFilter[] = [];
  const activeFormValues: FlowsFilterValues = {};
  let key: keyof typeof filters;
  for (key in filters) {
    const fieldValue = filters[key];
    if (
      !(
        (Array.isArray(fieldValue) && fieldValue.length === 0) ||
        fieldValue === false ||
        fieldValue === '' ||
        fieldValue === null
      )
    ) {
      let displayValue = '';

      if (typeof fieldValue === 'string') {
        displayValue = displayValue.concat(fieldValue);
      } else if (Array.isArray(fieldValue)) {
        displayValue = fieldValue.map((x) => x.label).join('<||>');
      } else if (typeof fieldValue === 'boolean') {
        displayValue = displayValue.concat(fieldValue.toString());
      }
      activeFormValues[key] = fieldValue as any;
      attributes.push({
        label: MAP_FILTER_VALUES_TO_I18[key],
        fieldName: key,
        displayValue: displayValue,
        value: fieldValue,
      });
    }
  }
  return { activeFormValues, attributes };
};

export const parseInitialValues = (
  filters: FlowsFilterValues | PendingFlowsFilterValues,
  initialValues: typeof filters
) => {
  let key: keyof typeof filters;
  for (key in initialValues) {
    filters[key] = (filters[key] ? filters[key] : initialValues[key]) as any;
  }
  return filters;
};
