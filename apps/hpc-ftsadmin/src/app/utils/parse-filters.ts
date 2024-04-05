import { categories, flows, organizations } from '@unocha/hpc-data';
import { PendingFlowsFilterValues } from '../components/filters/filter-pending-flows-table';
import { Strings } from '../../i18n/iface';
import { OrganizationFilterValues } from '../components/filters/filter-organization-table';
import { Dayjs } from 'dayjs';
import { FlowsFilterValues } from '../components/filters/filter-flows-table';
import { valueToInteger } from './map-functions';
import { FormObjectValue } from '@unocha/hpc-ui';

/**
 * The whole idea of this filtering system is to parse every Filter Form to a common type, in this case Filter<T>
 * that works with any Table component and that can be encoded in the URL. Having this common type let us parse it back to the Filter Form of T
 * or to the API parsed parameters, in this way we can share URLs and have all necessary info.
 */

export type Filters =
  | FlowsFilterValues
  | PendingFlowsFilterValues
  | OrganizationFilterValues;

export type FilterKeys =
  | keyof Strings['components']['flowsFilter']['filters']
  | keyof Strings['components']['pendingFlowsFilter']['filters']
  | keyof Strings['components']['organizationsFilter']['filters'];

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

export type FlowStatusType =
  | 'commitment'
  | 'carryover'
  | 'paid'
  | 'pledged'
  | 'parked'
  | 'pass_through'
  | 'standard';

/**
 * Type guard functions
 */

const filterValueIsString = (value: FilterValues): value is string => {
  return typeof value === 'string';
};

const filterValueIsArrayString = (value: FilterValues): value is string[] => {
  return Array.isArray(value) && typeof value[0] === 'string';
};

const filterValueIsBoolean = (value: FilterValues): value is boolean => {
  return typeof value === 'boolean';
};

const filterValueIsFormObjectValue = (
  value: FilterValues
): value is FormObjectValue => {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    Object.keys(value).includes('displayLabel') &&
    Object.keys(value).includes('value')
  );
};

const filterValueIsArrayFormObjectValue = (
  value: FilterValues
): value is Array<FormObjectValue> => {
  return Array.isArray(value) && typeof value[0] !== 'string';
};

const filterValueIsDayJS = (value: FilterValues): value is Dayjs => {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    !filterValueIsFormObjectValue(value)
  );
};

const filterValueIsFlowStatusType = (
  value: FilterValues
): value is FlowStatusType => {
  const values = [
    'commitment',
    'carryover',
    'paid',
    'pledged',
    'parked',
    'pass_through',
    'standard',
  ];
  if (typeof value === 'string') {
    return values.includes(value);
  }
  return false;
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
  const res = {} as T;
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

type FlowObjectTypes =
  | 'location'
  | 'organization'
  | 'usageYear'
  | 'location'
  | 'project'
  | 'plan'
  | 'globalCluster'
  | 'emergency';

export const parseFormFilters = <
  T extends FilterKeys,
  K extends {
    [x in T]?: FilterValues | undefined;
  },
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
        : filterValueIsFormObjectValue(fieldValue)
        ? fieldValue.displayLabel
        : fieldValue.toString();

      if (
        JSON.stringify(parsedFormValue[key]?.value) !==
        JSON.stringify(fieldValue)
      ) {
        //  Type missmatch is due to the typing is only accepting string values for keys, instead of string | number | symbol
        parsedFormValue[key as unknown as T] = {
          displayValue: displayValue,
          value: fieldValue,
        };
      }
    }
  }
  return parsedFormValue;
};

const parseActiveStatus = (activeStatus: string): boolean | undefined => {
  if (activeStatus === 'true') return true;
  else if (activeStatus === 'false') return false;

  return undefined;
};

export const parseFlowFilters = (
  filters: Filter<keyof Strings['components']['flowsFilter']['filters']>,
  pending?: boolean
): flows.SearchFlowsParams => {
  const res: flows.SearchFlowsParams = {
    flowFilters: {},
    nestedFlowFilters: {},
    flowObjectFilters: [],
    pending: pending,
    flowCategoryFilters: [],
  };
  if (
    !res.flowFilters ||
    !res.flowObjectFilters ||
    !res.flowCategoryFilters ||
    !res.nestedFlowFilters
  )
    return res;
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
          const value = filters[key]?.value;
          if (extractedDetails && value) {
            if (filterValueIsArrayFormObjectValue(value)) {
              res.flowObjectFilters = [
                ...res.flowObjectFilters,
                ...value.map((flowObject) => ({
                  objectID: valueToInteger(flowObject.value),
                  direction: extractedDetails.direction,
                  objectType: extractedDetails.object,
                })),
              ];
            }
          }
          break;
        }
        case 'reporterRefCode':
        case 'sourceSystemID': {
          const value = filters[key]?.value;
          if (!value) {
            break;
          }
          if (filterValueIsString(value)) {
            res.nestedFlowFilters[key] = value;
          }
          break;
        }
        case 'legacyID': {
          const legacyID = filters[key]?.value;
          if (!legacyID) {
            break;
          }
          if (filterValueIsString(legacyID)) {
            res.nestedFlowFilters[key] = valueToInteger(legacyID);
          }
          break;
        }
        case 'amountUSD': {
          const amountUSD = filters[key]?.value;
          if (!amountUSD) {
            break;
          }
          if (filterValueIsString(amountUSD)) {
            res.flowFilters[key] = valueToInteger(amountUSD);
          }
          break;
        }
        case 'flowID': {
          const ids = filters.flowID?.value;
          if (!ids) {
            break;
          }
          if (filterValueIsArrayString(ids)) {
            res.flowFilters.id = ids.map((id) => valueToInteger(id));
          }
          break;
        }
        case 'flowType':
        case 'flowStatus': {
          const filterValue = filters[key]?.value;
          if (!filterValue) {
            break;
          }
          if (filterValueIsFlowStatusType(filterValue)) {
            res[filterValue] = true;
          }
          break;
        }
        case 'restricted': {
          const restricted = filters.restricted?.value;
          if (!restricted) {
            break;
          }
          if (filterValueIsBoolean(restricted)) {
            res.flowFilters.restricted = restricted;
          }
          break;
        }
        case 'includeChildrenOfParkedFlows': {
          const value = filters.includeChildrenOfParkedFlows?.value;
          if (!value) {
            break;
          }
          if (filterValueIsBoolean(value)) {
            res[key] = value;
          }
          break;
        }
        case 'flowActiveStatus': {
          const flowActiveStatus = filters[key]?.value;
          if (!flowActiveStatus) {
            break;
          }
          if (
            filterValueIsFormObjectValue(flowActiveStatus) &&
            typeof flowActiveStatus.value === 'string'
          ) {
            res.flowFilters.activeStatus = parseActiveStatus(
              flowActiveStatus.value
            );
          }
          break;
        }
        case 'keywords': {
          const keywords = filters.keywords?.value;
          if (!keywords) {
            break;
          }
          if (filterValueIsArrayFormObjectValue(keywords)) {
            const parsedCategories = keywords.map(
              (keyword): { id: number; group: categories.CategoryGroup } => {
                return { id: valueToInteger(keyword.value), group: 'keywords' };
              }
            );
            res.flowCategoryFilters = [
              ...res.flowCategoryFilters,
              ...(parsedCategories ? parsedCategories : []),
            ];
          }
          break;
        }
      }
    }
  }
  return res;
};

export const parseOrganizationFilters = (
  filters: Filter<keyof Strings['components']['organizationsFilter']['filters']>
): organizations.SearchOrganizationParams => {
  const res: organizations.SearchOrganizationParams = { search: {} };
  for (const key in filters) {
    if (isKey(filters, key)) {
      switch (key) {
        case 'parentOrganization':
        case 'organizationType': {
          const value = filters[key]?.value;
          if (!value) {
            break;
          }
          if (filterValueIsFormObjectValue(value)) {
            res.search[key] = {
              name: value.displayLabel,
              id: valueToInteger(value.value),
            };
          }
          break;
        }
        case 'locations': {
          const locations = filters.locations?.value;
          if (!locations) {
            break;
          }
          if (filterValueIsFormObjectValue(locations)) {
            res.search[key] = [
              {
                name: locations.displayLabel,
                id: valueToInteger(locations.value),
              },
            ];
          }
          break;
        }
        case 'organization': {
          const organization = filters.organization?.value;
          if (!organization) {
            break;
          }
          if (filterValueIsString(organization)) {
            res.search.organization = {
              name: organization,
            };
          }
          break;
        }
        case 'date': {
          const date = filters.date?.value;
          if (!date) {
            break;
          }
          if (filterValueIsDayJS(date)) {
            res.search.date = date.toString();
          } else if (filterValueIsString(date)) {
            res.search.date = date;
          }
          break;
        }
        default: {
          const value = filters[key]?.value;
          if (!value) {
            break;
          }
          if (filterValueIsString(value)) {
            res.search[key] = value;
          }
          break;
        }
      }
    }
  }
  return res;
};
