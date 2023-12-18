import { categories, flows } from '@unocha/hpc-data';
import { FlowsFilterValuesREST } from '../components/filters/filter-flows-REST-table';
import { formValueToID, formValueToLabel } from './map-functions';
import { PendingFlowsFilterValues } from '../components/filters/filter-pending-flows-table';
import { Strings } from '../../i18n/iface';
import { OrganizationFilterValues } from '../components/filters/filter-organization-table';
import { Dayjs } from 'dayjs';

export type Filters =
  | FlowsFilterValuesREST
  | PendingFlowsFilterValues
  | OrganizationFilterValues;
export type FilterKeys =
  | keyof Strings['components']['flowsFilter']['filters']
  | keyof Strings['components']['pendingFlowsFilter']['filters']
  | keyof Strings['components']['organizationsFilter']['filters'];

export type FormObjectValue = { displayLabel: string; value: string };
export type FilterValues =
  | string
  | string[]
  | boolean
  | FormObjectValue
  | null
  | Array<FormObjectValue>
  | Dayjs;

export type Filter<T extends FilterKeys> = {
  [key in T]?: {
    value: FilterValues;
    displayValue: string;
  };
};

const parseInInitialValues = <T extends Filters>(
  filters: T,
  initialValues: T
) => {
  for (const key in initialValues) {
    filters[key] = filters[key] ? filters[key] : initialValues[key];
  }
  return filters;
};
export const parseOutInitialValues = <T extends Filters>(
  filters: T,
  initialValues: T
) => {
  const res: T = {} as T;
  for (const key in filters) {
    if (JSON.stringify(filters[key]) !== JSON.stringify(initialValues[key]))
      res[key] = filters[key];
  }
  return res;
};
export const encodeFilters = <T extends Filters>(
  filters: T,
  initialValue: T
) => {
  const cleanedFilters = parseOutInitialValues(filters, initialValue);
  return JSON.stringify(cleanedFilters);
};

export const decodeFilters = <T extends Filters>(
  stringFilters: string,
  initialValues: T
): T => {
  try {
    const res: T = parseInInitialValues<T>(
      JSON.parse(stringFilters),
      initialValues
    );
    return res;
  } catch (err) {
    console.warn(
      err,
      'Error parsing query to JSON. Reseting to initial Values...'
    );
    return initialValues;
  }
};

type ParsedFlowFiltersREST = {
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

function instanceOfFormObjectValue(
  object: NonNullable<unknown>
): object is FormObjectValue {
  try {
    return (
      typeof object !== 'string' &&
      typeof object !== 'boolean' &&
      typeof object !== 'number' &&
      'displayLabel' in object &&
      'value' in object
    );
  } catch {
    console.warn('Unsuportted value supplied to function');
    return false;
  }
}
export function isKey<T extends object>(x: T, k: PropertyKey): k is keyof T {
  return k in x;
}

function isFlowObjectTypes(value: string): value is FlowObjectTypes {
  return [
    'location',
    'emergency',
    'globalCluster',
    'organization',
    'plan',
    'project',
    'usageYear',
  ].includes(value);
}
export const extractDirectionObject = (
  inputString: FilterKeys
): {
  direction: 'source' | 'destination';
  object: FlowObjectTypes;
} | null => {
  const match = inputString.match(
    /^(source|destination)(Locations|Emergencies|GlobalClusters|Organizations|Plans|Projects|UsageYears)$/
  );

  if (match) {
    let singularObject = match[2].replace(/ies$/, 'y');
    singularObject = singularObject.replace(/s$/, '');
    const direction = match[1];
    const lowerCaseSingularObject =
      singularObject.charAt(0).toLowerCase() + singularObject.slice(1);
    return (direction === 'destination' || direction === 'source') &&
      isFlowObjectTypes(lowerCaseSingularObject)
      ? { direction: direction, object: lowerCaseSingularObject }
      : null;
  } else {
    return null;
  }
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
  | 'location'
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

export const parseFormFilters = <
  T extends FilterKeys,
  K extends {
    [x in T]?: FilterValues | undefined;
  }
>(
  filters: K,
  initialValues: K
): Filter<T> => {
  const cleanedFilters = parseOutInitialValues(filters, initialValues);
  const parsedFormValue: Filter<T> = {};
  for (const key in cleanedFilters) {
    const fieldValue = cleanedFilters[key];

    if (fieldValue !== null && fieldValue !== undefined) {
      const displayValue = Array.isArray(fieldValue)
        ? fieldValue
            .map((x) => (typeof x === 'string' ? x : x.displayLabel))
            .join('<||>')
        : instanceOfFormObjectValue(fieldValue)
        ? fieldValue.displayLabel
        : fieldValue.toString();

      if (
        JSON.stringify(parsedFormValue[key]?.value) !==
        JSON.stringify(fieldValue)
      ) {
        parsedFormValue[key as unknown as T] = {
          displayValue: displayValue,
          value: fieldValue,
        };
      }
    }
  }
  return parsedFormValue;
};

export const parseFlowFiltersREST = (
  filters: Filter<keyof Strings['components']['flowsFilter']['filters']>
): ParsedFlowFiltersREST => {
  const res: ParsedFlowFiltersREST = {};
  console.log(filters);
  for (const key in filters) {
    if (isKey(filters, key)) {
      switch (key) {
        case 'destinationLocations':
        case 'destinationEmergencies':
        case 'destinationGlobalClusters':
        case 'destinationOrganizations':
        case 'destinationPlans':
        case 'destinationProjects':
        case 'destinationUsageYears':
        case 'sourceLocations':
        case 'sourceEmergencies':
        case 'sourceGlobalClusters':
        case 'sourceOrganizations':
        case 'sourcePlans':
        case 'sourceProjects':
        case 'sourceUsageYears': {
          const extractedDetails = extractDirectionObject(key);
          if (extractedDetails) {
            res.flowObjects = [
              ...(res.flowObjects ? res.flowObjects : []),
              ...parseFlowObject({
                values: formValueToID(
                  filters[key]?.value as Array<FormObjectValue>
                ),
                objectType: extractedDetails.object,
                refDirection: extractedDetails.direction,
              }),
            ];
          }
          break;
        }
        case 'amountUSD': {
          const amountUSD = parseInt(filters.amountUSD?.value as string);
          res.amountUSD = amountUSD;
          break;
        }
        case 'flowID': {
          const ids = (filters.flowID?.value as string[]).map((x) =>
            parseInt(x)
          );
          res.flowID = ids;
          break;
        }
        case 'flowActiveStatus': {
          res.flowActiveStatus = {
            activeStatus: { name: filters.flowActiveStatus?.value as string },
          };
          break;
        }
        case 'keywords': {
          const parsedCategories = parseCategories(
            formValueToLabel(
              filters.keywords?.value as Array<FormObjectValue>
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
              name: filters.flowStatus?.value as string,
              group: 'flowStatus',
            },
          ];
          break;
        }
        case 'flowType': {
          res.categories = [
            ...(res.categories ? res.categories : []),
            {
              name: filters.flowType?.value as string,
              group: 'flowStatus',
            },
          ];

          break;
        }
        case 'includeChildrenOfParkedFlows': {
          res.includeChildrenOfParkedFlows = filters[key]?.value as boolean;
          break;
        }
        default: {
          const remainingKey: keyof ParsedFlowFiltersREST = key;
          res[remainingKey] = filters[key]?.value as string;
          break;
        }
      }
    }
  }
  return res;
};

export interface ParsedFlowsFilter {
  flowFilters: {
    id?: number[];
    activeStatus?: boolean;
    status?: string;
    type?: string;
    amountUSD?: number;
    reporterRefCode?: number;
    sourceSystemID?: number;
    legacyID?: number;
  };
  flowObjectFilters: Array<{
    objectID: number;
    direction: 'source' | 'destination';
    objectType: FlowObjectTypes;
  }>;
  pending?: boolean;
  flowCategoryFilters: Array<{
    id: number;
    group: categories.CategoryGroup;
  }>;
  includeChildrenOfParkedFlows?: boolean;
}
export const parseFlowFilters = (
  filters: Filter<keyof Strings['components']['flowsFilter']['filters']>,
  pending?: boolean
): ParsedFlowsFilter => {
  const res: ParsedFlowsFilter = {
    flowFilters: {},
    flowObjectFilters: [],
    pending: pending,
    flowCategoryFilters: [],
  };

  for (const key in filters) {
    if (isKey(filters, key)) {
      switch (key) {
        case 'destinationLocations':
        case 'destinationEmergencies':
        case 'destinationGlobalClusters':
        case 'destinationOrganizations':
        case 'destinationPlans':
        case 'destinationProjects':
        case 'destinationUsageYears':
        case 'sourceLocations':
        case 'sourceEmergencies':
        case 'sourceGlobalClusters':
        case 'sourceOrganizations':
        case 'sourcePlans':
        case 'sourceProjects':
        case 'sourceUsageYears': {
          const extractedDetails = extractDirectionObject(key);
          if (extractedDetails) {
            res.flowObjectFilters = [
              ...res.flowObjectFilters,
              ...(filters[key]?.value as Array<FormObjectValue>).map(
                (flowObject) => ({
                  objectID: parseInt(flowObject.value),
                  direction: extractedDetails.direction,
                  objectType: extractedDetails.object,
                })
              ),
            ];
          }
          break;
        }
        case 'reporterRefCode':
        case 'legacyID':
        case 'sourceSystemID':
        case 'amountUSD': {
          const parsedValue = parseInt(filters[key]?.value as string);
          res.flowFilters[key] = parsedValue;
          break;
        }
        case 'flowID': {
          const ids = (filters.flowID?.value as string[]).map((x) =>
            parseInt(x)
          );
          res.flowFilters.id = ids;
          break;
        }
        case 'flowType':
        case 'flowStatus': {
          const parsedName = key === 'flowStatus' ? 'status' : 'type';
          res.flowFilters[parsedName] = filters[key]?.value as string;
          break;
        }
        case 'includeChildrenOfParkedFlows': {
          res.includeChildrenOfParkedFlows = filters
            .includeChildrenOfParkedFlows?.value as boolean;
          break;
        }
        case 'flowActiveStatus': {
          res.flowFilters.activeStatus = filters[key]?.value as boolean;
          break;
        }
        case 'keywords': {
          const parsedCategories = (
            filters.keywords?.value as Array<FormObjectValue>
          ).map((keyword): { id: number; group: categories.CategoryGroup } => {
            return { id: parseInt(keyword.value), group: 'keywords' };
          });

          res.flowCategoryFilters = [
            ...res.flowCategoryFilters,
            ...(parsedCategories ? parsedCategories : []),
          ];
          break;
        }
      }
    }
  }
  return res;
};

interface ParsedOrganizationFilters {
  status?: string;
  date?: string;
  locations?: Array<{ name: string; id: number }>;
  verified?: string;
  parentOrganization?: { name: string; id: number };
  organizationType?: { name: string; id: number };
  organization?: { name: string };
}

export const parseOrganizationFilters = (
  filters: Filter<keyof Strings['components']['organizationsFilter']['filters']>
): ParsedOrganizationFilters => {
  const res: ParsedOrganizationFilters = {};
  console.log(filters);
  for (const key in filters) {
    if (isKey(filters, key)) {
      switch (key) {
        case 'parentOrganization':
        case 'organizationType': {
          const val = filters[key]?.value as FormObjectValue;
          res[key] = {
            name: val.displayLabel,
            id: parseInt(val.value),
          };
          break;
        }
        case 'locations': {
          const locations = filters.locations
            ?.value as OrganizationFilterValues['locations'];
          if (locations) {
            res[key] = [
              { name: locations.displayLabel, id: parseInt(locations.value) },
            ];
          }
          break;
        }
        case 'organization': {
          res.organization = { name: filters?.organization?.value as string };
          break;
        }
        default: {
          res[key] = filters[key]?.value as string;
          break;
        }
      }
    }
  }
  return res;
};
