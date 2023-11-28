import { categories, flows } from '@unocha/hpc-data';
import { FlowsFilterValues } from '../components/filter-flows-table';
import { ActiveFilter, ParsedFilters } from '../components/flows-table';
import { formValueToID, formValueToLabel } from './map-functions';
import { PendingFlowsFilterValues } from '../components/filter-pending-flows-table';
import { Strings } from '../../i18n/iface';
import { OrganizationFilterValues } from '../components/filter-organization-table';

export const MAP_FILTER_FLOW_VALUES_TO_I18: Record<
  keyof FlowsFilterValues,
  keyof Strings['components']['flowsFilter']['filters']
> = {
  amountUSD: 'amountUSD',
  destinationCountries: 'destinationCountries',
  destinationEmergencies: 'destinationEmergencies',
  destinationGlobalClusters: 'destinationGlobalClusters',
  destinationOrganizations: 'destinationOrganizations',
  destinationPlans: 'destinationPlans',
  destinationProjects: 'destinationProjects',
  destinationUsageYears: 'destinationUsageYears',
  sourceCountries: 'sourceCountries',
  sourceEmergencies: 'sourceEmergencies',
  sourceGlobalClusters: 'sourceGlobalClusters',
  sourceOrganizations: 'sourceOrganizations',
  sourcePlans: 'sourcePlans',
  sourceProjects: 'sourceProjects',
  sourceUsageYears: 'sourceUsageYears',
  flowActiveStatus: 'flowActiveStatus',
  flowID: 'flowID',
  legacyID: 'legacyID',
  flowStatus: 'flowStatus',
  flowType: 'flowType',
  includeChildrenOfParkedFlows: 'includeChildrenOfParkedFlows',
  keywords: 'keywords',
  reporterRefCode: 'reporterRefCode',
  sourceSystemID: 'sourceSystemID',
};
export const MAP_FILTER_ORGANIZATION_VALUES_TO_I18: Record<
  keyof OrganizationFilterValues,
  keyof Strings['components']['organizationsFilter']['filters']
> = {
  organizationName: 'organizationName',
  active: 'active',
  addedModifiedSince: 'addedModifiedSince',
  country: 'country',
  organizationType: 'organizationType',
  parentOrganization: 'parentOrganization',
};

export const parseFlowFilters = (
  filters: FlowsFilterValues | PendingFlowsFilterValues
): ParsedFilters | undefined => {
  if (!filters) return;

  const res: ParsedFilters = {};
  const typedFormFields: flows.FlowFilters = {};

  let key: keyof typeof filters;
  for (key in filters) {
    if (key.includes('destination') || key.includes('source')) {
      typedFormFields[key] = formValueToID(
        filters[key] as Array<FormObjectValue>
      ) as any;
    } else if (key.includes('amountUSD')) {
      const value = parseInt(filters[key] as string) as any;
      typedFormFields[key] = value;
      res[key as keyof ParsedFilters] = value;
    } else if (['flowID'].includes(key)) {
      const value = (filters[key] as unknown as string[]).map((x) =>
        parseInt(x)
      ) as any;
      typedFormFields[key] = value;
      res[key as keyof ParsedFilters] = value;
    } else if ((key as keyof FlowsFilterValues) === 'keywords') {
      // NOT CHANGED
      typedFormFields.keywords = formValueToLabel(
        filters[key] as Array<FormObjectValue>
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
        displayValue = fieldValue.map((x) => x.displayLabel).join('<||>');
      } else if (typeof fieldValue === 'boolean') {
        displayValue = displayValue.concat(fieldValue.toString());
      }
      activeFormValues[key] = fieldValue as any;
      attributes.push({
        label: MAP_FILTER_FLOW_VALUES_TO_I18[key],
        fieldName: key,
        displayValue: displayValue,
        value: fieldValue,
      });
    }
  }
  return { activeFormValues, attributes };
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

type FlowObjectTypes =
  | 'location'
  | 'organization'
  | 'usageYear'
  | 'country'
  | 'project'
  | 'plan'
  | 'globalCluster'
  | 'emergency';
const parseFlowObject = (flowObject: {
  values: number[] | undefined;
  refDirection: 'source' | 'destination';
  objectType: FlowObjectTypes;
}): flows.FlowObject[] => {
  const res: flows.FlowObject[] = [];

  if (flowObject.values) {
    res.push(
      ...flowObject.values.map((value) => ({
        objectID: value,
        refDirection: flowObject.refDirection,
        objectType: flowObject.objectType,
      }))
    );
  }
  return res;
};

// OLD VERSION
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

export type FormObjectValue = { displayLabel: string; value: string };
type FilterKeys =
  | keyof Strings['components']['flowsFilter']['filters']
  | keyof Strings['components']['organizationsFilter']['filters'];

export type RebuiltFilter<T extends FilterKeys> = {
  [key in T]: {
    value:
      | string
      | string[]
      | boolean
      | number
      | FormObjectValue
      | Array<FormObjectValue>
      | undefined;
    active?: boolean;
    displayValue?: string;
  };
};

type ParsedFlowFilters = {
  flowID?: number[];
  amountUSD?: number;
  sourceSystemID?: string;
  dataProvider?: { systemID: string };
  flowActiveStatus?: { activeStatus: { name: string } };
  status?: { status: string };
  reporterRefCode?: string;
  legacyID?: string;
  flowObjects?: flows.FlowObject[];
  categories?: flows.FlowCategory[];
  includeChildrenOfParkedFlows?: boolean;
};

function isKey<T extends object>(x: T, k: PropertyKey): k is keyof T {
  return k in x;
}
function extractDirectionObject(
  inputString:
    | 'destinationCountries'
    | 'destinationEmergencies'
    | 'destinationGlobalClusters'
    | 'destinationOrganizations'
    | 'destinationPlans'
    | 'destinationProjects'
    | 'destinationUsageYears'
    | 'sourceCountries'
    | 'sourceEmergencies'
    | 'sourceGlobalClusters'
    | 'sourceOrganizations'
    | 'sourcePlans'
    | 'sourceProjects'
    | 'sourceUsageYears'
): {
  direction: 'source' | 'destination';
  object: FlowObjectTypes;
} | null {
  const match = inputString.match(
    /^(source|destination)(Countries|Emergencies|GlobalClusters|Organizations|Plans|Projects|UsageYears)$/
  );

  if (match) {
    let singularObject = match[2].replace(/ies$/, 'y');
    singularObject = singularObject.replace(/s$/, ''); // Remove 's' at the end for singular form
    const direction = match[1];
    // Additional rules for specific cases

    const lowerCaseSingularObject =
      singularObject.charAt(0).toLowerCase() + singularObject.slice(1); // Convert first character to lowercase
    return (direction === 'destination' || direction === 'source') &&
      (lowerCaseSingularObject === 'country' ||
        lowerCaseSingularObject === 'emergency' ||
        lowerCaseSingularObject === 'globalCluster' ||
        lowerCaseSingularObject === 'organization' ||
        lowerCaseSingularObject === 'plan' ||
        lowerCaseSingularObject === 'project' ||
        lowerCaseSingularObject === 'usageYear')
      ? { direction: direction, object: lowerCaseSingularObject }
      : null;
  } else {
    return null;
  }
}

export const parseFlowFiltersRebuilt = (
  filters: RebuiltFilter<keyof Strings['components']['flowsFilter']['filters']>
): ParsedFlowFilters => {
  const res: ParsedFlowFilters = {};
  for (const key in filters) {
    if (isKey(filters, key)) {
      switch (key) {
        case 'destinationCountries':
        case 'destinationEmergencies':
        case 'destinationGlobalClusters':
        case 'destinationOrganizations':
        case 'destinationPlans':
        case 'destinationProjects':
        case 'destinationUsageYears':
        case 'sourceCountries':
        case 'sourceEmergencies':
        case 'sourceGlobalClusters':
        case 'sourceOrganizations':
        case 'sourcePlans':
        case 'sourceProjects':
        case 'sourceUsageYears': {
          const extractedDetails = extractDirectionObject(key);
          if (extractedDetails) {
            res.flowObjects = parseFlowObject({
              values: formValueToID(filters[key].value as FormObjectValue[]),
              objectType: extractedDetails.object,
              refDirection: extractedDetails.direction,
            });
          }
          break;
        }
        case 'amountUSD': {
          const amountUSD = parseInt(filters.amountUSD.value as string);
          res.amountUSD = amountUSD;
          break;
        }
        case 'flowID': {
          const ids = (filters.flowID.value as string[]).map((x) =>
            parseInt(x)
          );
          res.flowID = ids;
          break;
        }
        case 'flowActiveStatus': {
          res.flowActiveStatus = {
            activeStatus: { name: filters.flowActiveStatus.value as string },
          };
          break;
        }
        case 'keywords': {
          const parsedCategories = parseCategories(
            formValueToLabel(
              filters.keywords.value as Array<FormObjectValue>
            ).map(
              (
                keyword
              ): { values: string; group: categories.CategoryGroup } => {
                return { values: keyword, group: 'keywords' };
              }
            )
          );
          res.categories = [
            ...(res.categories ? res.categories : []),
            ...(parsedCategories ? parsedCategories : []),
          ];
          break;
        }
        case 'flowStatus': {
          res.categories = [
            ...(res.categories ? res.categories : []),
            {
              name: filters.flowStatus.value as string,
              group: 'flowStatus',
            },
          ];
          break;
        }
        case 'flowType': {
          res.categories = [
            ...(res.categories ? res.categories : []),
            {
              name: filters.flowType.value as string,
              group: 'flowStatus',
            },
          ];

          break;
        }
        case 'includeChildrenOfParkedFlows': {
          res.includeChildrenOfParkedFlows = filters[key].value as boolean;
          break;
        }
        default: {
          const remainingKey: keyof ParsedFlowFilters = key;
          res[remainingKey] = filters[key].value as string;
          break;
        }
      }
    }
  }
  return res;
};

export const parseFormFiltersRebuilt = <
  T extends FilterKeys,
  K extends {
    [x in T]: string | string[] | Array<FormObjectValue> | boolean;
  }
>(
  filters: K,
  initialValue: K
): RebuiltFilter<T> => {
  const parsedFormValue: RebuiltFilter<T> = Object.fromEntries(
    Object.entries(initialValue).map(([key, value]) => [
      key,
      { value: value, active: false },
    ])
  ) as RebuiltFilter<T>;
  for (const key in filters) {
    const fieldValue = filters[key];
    const displayValue = Array.isArray(fieldValue)
      ? fieldValue
          .map((x) => (typeof x === 'string' ? x : x.displayLabel))
          .join('<||>')
      : fieldValue.toString();

    if (
      isKey(parsedFormValue, key) &&
      parsedFormValue[key].value !== fieldValue
    ) {
      parsedFormValue[key] = {
        active: true,
        displayValue: displayValue,
        value: fieldValue,
      };
    }
  }
  return parsedFormValue;
};
