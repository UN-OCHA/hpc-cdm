import {
  type categories,
  type flows,
  type organizations,
  type util,
} from '@unocha/hpc-data';
import { type Dayjs } from 'dayjs';
import { type Strings } from '../../i18n/iface';
import dayjs from '../../libs/dayjs';
import { type FlowsFilterValues } from '../components/filters/filter-flows-table';
import { type OrganizationFilterValues } from '../components/filters/filter-organization-table';
import { type PendingFlowsFilterValues } from '../components/filters/filter-pending-flows-table';
import { SPECIAL_SEPARATOR } from './constants';
import {
  isArrayFormObjectValue,
  isFormObjectValue,
  type RefDirection,
} from './parse-flow-form';
import { currencyToInteger, valueToInteger } from './utils';

/*
 * The whole idea of this filtering system is to parse
 * every Filter Form to a common type, in this case `Filter<T>`
 * that works with any `Table` component and that can be encoded
 * in the URL. Having this common type let us parse it back
 * to the Filter Form of T or to the API parsed parameters,
 * in this way we can share URLs and have all necessary info.
 */

export type Filters =
  | FlowsFilterValues
  | PendingFlowsFilterValues
  | OrganizationFilterValues;

export type FilterKey =
  | keyof Strings['components']['flowsFilter']['filters']
  | keyof Strings['components']['pendingFlowsFilter']['filters']
  | keyof Strings['components']['organizationsFilter']['filters'];

export type FilterValue =
  | string
  | string[]
  | boolean
  | util.FormObjectValue
  | null
  | util.FormObjectValue[]
  | Dayjs;

type EmptyValue = null | '' | [] | false;

export type Filter<T extends FilterKey> = {
  [key in T]?: {
    value: FilterValue;
    displayValue: string;
  };
};

export type FlowStatusType =
  | 'commitment'
  | 'carryover'
  | 'paid'
  | 'pledge'
  | 'parked'
  | 'pass_through'
  | 'standard';

/*
 * Type guard functions
 */

const isEmptyValue = (value: unknown): value is EmptyValue =>
  value === null ||
  value === false ||
  (typeof value === 'string' && value === '') ||
  (Array.isArray(value) && value.length === 0);

const filterValueIsString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const filterValueIsStringArray = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
};

const filterValueIsBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

const filterValueIsFormObjectValue = (
  value: unknown
): value is util.FormObjectValue => isFormObjectValue(value);

const filterValueIsArrayFormObjectValue = (
  value: unknown
): value is util.FormObjectValue[] => isArrayFormObjectValue(value);

const filterValueIsDayJS = (value: FilterValue): value is Dayjs => {
  return dayjs.isDayjs(value);
};

const filterValueIsFlowStatusType = (
  value: unknown
): value is FlowStatusType => {
  const values = [
    'commitment',
    'carryover',
    'paid',
    'pledge',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: Record<keyof T, any>,
  initialValues: T
) => {
  for (const key in initialValues) {
    //  `dayjs` object gets stringified to its .toString(), so we need
    //  to convert it back to a dayjs object
    const isInitialValueDayJS =
      (initialValues[key] === null || dayjs.isDayjs(initialValues[key])) &&
      typeof filters[key] === 'string';

    if (isInitialValueDayJS) {
      filters[key] = dayjs(filters[key]);
      continue;
    }
    filters[key] = filters[key] ?? initialValues[key];
  }
  return filters;
};
export const parseOutEmptyInitialValues = <T extends Filters>(
  filters: T,
  initialValues: T
) => {
  const res = {} as T;
  for (const key in filters) {
    if (
      !isEmptyValue(filters[key]) ||
      JSON.stringify(filters[key]) !== JSON.stringify(initialValues[key])
    ) {
      res[key] = filters[key];
    }
  }
  return res;
};
export const encodeFilters = <T extends Filters>(
  filters: T,
  initialValue: T
) => {
  const cleanedFilters = parseOutEmptyInitialValues(filters, initialValue);
  return JSON.stringify(cleanedFilters);
};

export const decodeFilters = <T extends Filters>(
  stringFilters: string,
  initialValues: T
): T => {
  try {
    const res: T = parseInInitialValues(
      JSON.parse(stringFilters),
      initialValues
    );
    return res;
  } catch (error) {
    console.warn(
      error,
      'Error parsing query to JSON. Resetting to initial Values...'
    );
    return initialValues;
  }
};

export function isKey<T>(x: T, k: PropertyKey): k is keyof T {
  return typeof x === 'object' && x !== null && k in x;
}

const FLOW_OBJECT_TYPES = new Set([
  'location',
  'emergency',
  'globalCluster',
  'governingEntity',
  'organization',
  'anonymizedOrganization',
  'plan',
  'project',
  'usageYear',
] as const);

export type FlowObjectTypes = typeof FLOW_OBJECT_TYPES extends Set<infer U>
  ? U
  : never;

export function isFlowObjectTypes(value: string): value is FlowObjectTypes {
  return (FLOW_OBJECT_TYPES as Set<string>).has(value);
}
export const extractDirectionObject = (
  inputString: FilterKey
): {
  direction: RefDirection;
  object: FlowObjectTypes;
} | null => {
  const match = inputString.match(
    /^(source|destination)(Locations|Emergencies|GlobalClusters|Organizations|AnonymizedOrganizations|Plans|Projects|UsageYears)$/
  );

  if (match) {
    let singularObject = match[2].replace(/ies$/, 'y');
    singularObject = singularObject.replace(/s$/, '');
    const direction = match[1];
    const lowerCaseSingularObject =
      singularObject.charAt(0).toLowerCase() + singularObject.slice(1);
    return (direction === 'destination' || direction === 'source') &&
      isFlowObjectTypes(lowerCaseSingularObject)
      ? { direction, object: lowerCaseSingularObject }
      : null;
  }
  return null;
};

export const parseFormFilters = <
  T extends FilterKey,
  K extends {
    [x in T]?: FilterValue | undefined;
  },
>(
  filters: K,
  initialValues: K
): Filter<T> => {
  const cleanedFilters = parseOutEmptyInitialValues(filters, initialValues);
  const parsedFormValue: Filter<T> = {};
  for (const key in cleanedFilters) {
    const fieldValue = cleanedFilters[key];

    if (fieldValue !== null && fieldValue !== undefined) {
      const displayValue = Array.isArray(fieldValue)
        ? fieldValue
            .map((x) => (typeof x === 'string' ? x : x.displayLabel))
            .join(SPECIAL_SEPARATOR)
        : filterValueIsFormObjectValue(fieldValue)
        ? fieldValue.displayLabel
        : fieldValue.toString();

      if (
        JSON.stringify(parsedFormValue[key]?.value) !==
        JSON.stringify(fieldValue)
      ) {
        //  Type miss-match is due to the typing is only accepting
        //  string values for keys, instead of `string | number | symbol`
        parsedFormValue[key as unknown as T] = {
          displayValue,
          value: fieldValue,
        };
      }
    }
  }
  return parsedFormValue;
};

const parseActiveStatus = (activeStatus: string): boolean | undefined => {
  if (activeStatus === 'true') {
    return true;
  } else if (activeStatus === 'false') {
    return false;
  }

  return undefined;
};

export const parseFlowFilters = (
  filters: Filter<
    | keyof Strings['components']['flowsFilter']['filters']
    | keyof Strings['components']['pendingFlowsFilter']['filters']
  >,
  pending?: boolean
): flows.SearchFlowsParams => {
  const res: flows.SearchFlowsParams = {
    flowFilters: {},
    nestedFlowFilters: {},
    flowObjectFilters: [],
    pending,
    flowCategoryFilters: [],
  };
  if (
    !res.flowFilters ||
    !res.flowObjectFilters ||
    !res.flowCategoryFilters ||
    !res.nestedFlowFilters
  ) {
    return res;
  }
  for (const key in filters) {
    if (!isKey(filters, key)) {
      continue;
    }

    const value = filters[key]?.value;
    if (!value) {
      continue;
    }

    switch (key) {
      case 'destinationLocations':
      case 'destinationEmergencies':
      case 'destinationGlobalClusters':
      case 'destinationOrganizations':
      case 'destinationAnonymizedOrganizations':
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
        if (extractedDetails && filterValueIsArrayFormObjectValue(value)) {
          res.flowObjectFilters = [
            ...res.flowObjectFilters,
            ...value.map((flowObject) => ({
              objectID: valueToInteger(flowObject.value),
              direction: extractedDetails.direction,
              objectType: extractedDetails.object,
            })),
          ];
        }
        break;
      }
      case 'reporterRefCode':
      case 'sourceSystemID': {
        if (filterValueIsString(value)) {
          res.nestedFlowFilters[key] = value;
        }
        break;
      }
      case 'legacyID': {
        if (filterValueIsString(value)) {
          res.nestedFlowFilters[key] = valueToInteger(value);
        }
        break;
      }
      case 'amountUSD': {
        if (filterValueIsString(value)) {
          res.flowFilters[key] = currencyToInteger(value);
        }
        break;
      }
      case 'flowID': {
        if (filterValueIsStringArray(value)) {
          res.flowFilters.id = value.map((id) => valueToInteger(id));
        }
        break;
      }
      case 'flowType':
      case 'flowStatus': {
        if (filterValueIsFormObjectValue(value)) {
          const { value: statusType } = value;
          if (filterValueIsFlowStatusType(statusType)) {
            res[statusType] = true;
          }
        }
        break;
      }
      case 'includeChildrenOfParkedFlows': {
        if (filterValueIsBoolean(value)) {
          res[key] = value;
        }
        break;
      }
      case 'flowActiveStatus': {
        if (filterValueIsFormObjectValue(value)) {
          const { value: flowActiveStatus } = value;

          if (typeof flowActiveStatus === 'string') {
            res.flowFilters.activeStatus = parseActiveStatus(flowActiveStatus);
          }
        }
        break;
      }
      case 'keywords': {
        if (filterValueIsArrayFormObjectValue(value)) {
          const parsedCategories = value.map(
            (keyword): { id: number; group: categories.CategoryGroup } => {
              return { id: valueToInteger(keyword.value), group: 'keywords' };
            }
          );
          res.flowCategoryFilters = [
            ...res.flowCategoryFilters,
            ...parsedCategories,
          ];
        }
        break;
      }
      case 'dataProvider': {
        if (filterValueIsFormObjectValue(value)) {
          const { value: dataProvider } = value;

          if (filterValueIsString(dataProvider)) {
            res.nestedFlowFilters.systemID = dataProvider;
          }
        }
        break;
      }
      case 'status': {
        if (filterValueIsFormObjectValue(value)) {
          const { value: status } = value;

          if (
            filterValueIsString(status) &&
            (status === 'new' || status === 'updated')
          ) {
            res.status = status;
          }
        }
        break;
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
    if (!isKey(filters, key)) {
      continue;
    }

    const value = filters[key]?.value;
    if (!value) {
      continue;
    }

    switch (key) {
      case 'parentOrganization':
      case 'organizationType': {
        if (filterValueIsFormObjectValue(value)) {
          res.search[key] = {
            name: value.displayLabel,
            id: valueToInteger(value.value),
          };
        }
        break;
      }
      case 'locations': {
        if (filterValueIsFormObjectValue(value)) {
          const { displayLabel, value: id, parent } = value;
          const location = {
            name: displayLabel,
            id: valueToInteger(id),
          };
          if (parent) {
            res.search[key] = [
              {
                ...location,
                parentId: valueToInteger(parent.value),
              },
              {
                name: parent.displayLabel,
                id: valueToInteger(parent.value),
              },
            ];
          } else {
            res.search[key] = [location];
          }
        }
        break;
      }
      case 'organization': {
        if (filterValueIsString(value)) {
          res.search.organization = {
            name: value,
          };
        }
        break;
      }
      case 'date': {
        if (filterValueIsDayJS(value)) {
          res.search.date = value.toString();
        } else if (filterValueIsString(value)) {
          res.search.date = value;
        }
        break;
      }
      default: {
        if (
          filterValueIsFormObjectValue(value) &&
          filterValueIsString(value.value)
        ) {
          res.search[key] = value.value;
        }
        break;
      }
    }
  }
  return res;
};
