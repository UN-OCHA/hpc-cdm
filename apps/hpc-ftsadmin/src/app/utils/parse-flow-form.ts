import { FormObjectValue, flows } from '@unocha/hpc-data';
import {
  INITIAL_FORM_VALUES,
  type FlowFormType,
  type FlowFormTypeValidated,
} from '../components/flow-form';
import {
  currencyToInteger,
  flowToFlowLinkProps,
  valueToInteger,
} from './map-functions';
import { FlowObjectTypes, isFlowObjectTypes } from './parse-filters';
import {
  defaultOptions,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from './fn-promises';

type FlowFormFlowObjectKey =
  | 'fundingSourceOrganizations'
  | 'fundingSourceLocations'
  | 'fundingSourceEmergencies'
  | 'fundingSourceGlobalClusters'
  | 'fundingSourcePlan'
  | 'fundingSourceProject'
  | 'fundingSourceUsageYears'
  | 'fundingSourceFieldClusters'
  | 'fundingDestinationOrganizations'
  | 'fundingDestinationLocations'
  | 'fundingDestinationEmergencies'
  | 'fundingDestinationGlobalClusters'
  | 'fundingDestinationPlan'
  | 'fundingDestinationProject'
  | 'fundingDestinationUsageYears'
  | 'fundingDestinationFieldClusters';

const categoryIds = (categories: Array<{ value: number | string } | null>) => {
  const ids: number[] = [];
  for (const category of categories) {
    if (category) {
      ids.push(valueToInteger(category.value));
    }
  }
  return ids;
};

const getFundingValues = (
  values: FlowFormTypeValidated
): Array<keyof FlowFormTypeValidated> => {
  const res: Array<keyof FlowFormTypeValidated> = [];

  let untypedKey: keyof FlowFormTypeValidated;
  for (untypedKey in values) {
    const key = untypedKey;
    if (key.includes('fundingSource') || key.includes('fundingDestination')) {
      res.push(key);
    }
  }
  return res;
};

export const isFormObjectValue = (value: unknown): value is FormObjectValue =>
  typeof value === 'object' &&
  !Array.isArray(value) &&
  value !== null &&
  Object.keys(value).includes('displayLabel') &&
  Object.keys(value).includes('value');

const isArrayFormObjectValue = (value: unknown): value is FormObjectValue[] => {
  return (
    Array.isArray(value) && (isFormObjectValue(value[0]) || value.length === 0)
  );
};

const createFlowObject = (
  direction: string,
  lowerCaseSingularObject: FlowObjectTypes,
  value: FormObjectValue
): flows.FlowObject => {
  const flowObject = {
    objectID: valueToInteger(value.value),
    objectType: lowerCaseSingularObject,
    behaviour: null,
  };
  if (direction === 'fundingSource') {
    return {
      ...flowObject,
      refDirection: 'source',
    };
  }
  return {
    ...flowObject,
    refDirection: 'destination',
  };
};

const extractDirectionObject = (
  key: keyof FlowFormType,
  values: FlowFormTypeValidated
): flows.FlowObject[] => {
  const match = key.match(
    /^(fundingSource|fundingDestination)(Locations|Emergencies|GlobalClusters|Organizations|Plan|Project|UsageYears|FieldClusters)$/
  );

  if (match && values[key] !== null) {
    let singularObject = match[2].replace(/ies$/, 'y');
    singularObject = singularObject.replace(/s$/, '');
    const direction = match[1];
    const lowerCaseSingularObject =
      singularObject.charAt(0).toLowerCase() + singularObject.slice(1);

    if (!isFlowObjectTypes(lowerCaseSingularObject)) {
      return [];
    }
    const value = values[key];
    if (isArrayFormObjectValue(value)) {
      return value.map((formObjectValue) =>
        createFlowObject(direction, lowerCaseSingularObject, formObjectValue)
      );
    } else if (isFormObjectValue(value)) {
      return [createFlowObject(direction, lowerCaseSingularObject, value)];
    }
  }
  return [];
};

//  TODO: Implement this function
export const parseFlowForm = (
  values: FlowFormTypeValidated
): flows.CreateFlowParams => {
  const {
    aidModality,
    amountOriginalCurrency,
    amountUSD,
    beneficiaryGroup,
    contributionType,
    currency,
    decisionDate,
    donorBudgetYear,
    earmarking,
    exchangeRate: dirtyExchangeRate,
    firstReported,
    flowDescription: description,
    flowDate,
    flowStatus,
    flowType,
    isNewMoney: newMoney,
    isErrorCorrection,
    isInactive,
    keywords,
    notes: dirtyNotes,
    restricted,
  } = values;

  const notes = dirtyNotes || undefined;
  const exchangeRate = dirtyExchangeRate || undefined;

  const categories = categoryIds([
    aidModality,
    beneficiaryGroup,
    contributionType,
    earmarking,
    flowStatus,
    flowType,
    ...keywords,
  ]);

  const flowObjects = getFundingValues(values).flatMap((key) =>
    extractDirectionObject(key, values)
  );

  const flow: flows.CreateFlowParams['flow'] = {
    activeStatus: !isInactive,
    amountUSD: currencyToInteger(amountUSD),
    budgetYear: valueToInteger(donorBudgetYear),
    categories,
    children: values.childFlows.map((childFlow) => ({ childID: childFlow.id })),
    decisionDate: decisionDate?.toISOString() ?? null,
    description,
    exchangeRate,
    firstReportedDate: firstReported.toISOString(),
    flowDate: flowDate.toISOString(),
    flowObjects,
    isCancellation: null, //  TODO
    isErrorCorrection,

    //  TODO: Don't hardcode this
    inactiveReason: isInactive
      ? [{ group: 'inactiveReason', id: 12, name: 'Cancelled' }]
      : [],
    newCategories: [], //  TODO
    newMoney,
    notes,
    origAmount: currencyToInteger(amountOriginalCurrency),
    origCurrency: currency?.value.toString() ?? null,
    parents: values.parentFlow ? [{ parentID: values.parentFlow.id }] : [],
    reportDetails: [], // TODO
    restricted,
  };
  return { flow };
};

const isCategoryGroupKeyFlowForm = (
  group: string
): group is keyof FlowFormType => {
  return [
    'flowStatus',
    'flowType',
    'earmarking',
    'aidModality',
    'beneficiaryGroup',
    'keyword',
  ].includes(group);
};

const categoriesToFlowForm = (values: flows.GetFlowResult) => {
  return values.categories.reduce((acc, { group, id, name }) => {
    let savedGroup = group;
    if (savedGroup === 'keyword') {
      savedGroup += 's';
    }
    if (isCategoryGroupKeyFlowForm(savedGroup)) {
      return { ...acc, [savedGroup]: { displayLabel: name, value: id } };
    }
    return acc;
  }, {} as FlowFormType);
};

const flowObjectToFormObjectValue = (
  flow: flows.GetFlowResult,
  keys: FlowFormFlowObjectKey[]
): FlowFormType => {
  const MAP_KEYS_TO_FIELDS: Record<
    FlowFormFlowObjectKey,
    FlowFormType[FlowFormFlowObjectKey]
  > = {
    fundingSourceOrganizations: organizationsOptions(
      flow.organizations.filter(
        (org) => org.flowObject.refDirection === 'source'
      )
    ),
    fundingSourceLocations: locationsOptions(
      flow.locations.filter((loc) => loc.flowObject.refDirection === 'source')
    ),
    fundingSourceEmergencies: defaultOptions(
      flow.emergencies.filter(
        (emergency) => emergency.flowObject.refDirection === 'source'
      )
    ),
    fundingSourceGlobalClusters: defaultOptions(
      flow.globalClusters.filter(
        (gC) => gC.flowObject.refDirection === 'source'
      )
    ),
    fundingSourcePlan:
      flow.plans
        .filter((plan) => plan.flowObject.refDirection === 'source')
        .map((plan) => ({
          displayLabel: plan.planVersion.name,
          value: plan.id,
        }))
        .at(0) ?? null,
    fundingSourceProject:
      flow.projects
        .filter((project) => project.flowObject.refDirection === 'source')
        .map((project) => ({
          displayLabel: project.projectVersions[0]?.name,
          value: project.id,
        }))
        .at(0) ?? null,
    fundingSourceUsageYears: usageYearsOptions(
      flow.usageYears.filter(
        (usageYear) => usageYear.flowObject.refDirection === 'source'
      )
    ),
    fundingSourceFieldClusters: flow.clusters
      .filter((cluster) => cluster.flowObject.refDirection === 'source')
      .map((cluster) => ({
        displayLabel: cluster.governingEntityVersion.name,
        value: cluster.id,
      })),
    fundingDestinationOrganizations: organizationsOptions(
      flow.organizations.filter(
        (org) => org.flowObject.refDirection === 'destination'
      )
    ),
    fundingDestinationLocations: locationsOptions(
      flow.locations.filter(
        (loc) => loc.flowObject.refDirection === 'destination'
      )
    ),
    fundingDestinationEmergencies: defaultOptions(
      flow.emergencies.filter(
        (emergency) => emergency.flowObject.refDirection === 'destination'
      )
    ),
    fundingDestinationGlobalClusters: defaultOptions(
      flow.globalClusters.filter(
        (gC) => gC.flowObject.refDirection === 'destination'
      )
    ),
    fundingDestinationPlan:
      flow.plans
        .filter((plan) => plan.flowObject.refDirection === 'destination')
        .map((plan) => ({
          displayLabel: plan.planVersion.name,
          value: plan.id,
        }))
        .at(0) ?? null,
    fundingDestinationProject:
      flow.projects
        .filter((project) => project.flowObject.refDirection === 'destination')
        .map((project) => ({
          displayLabel: project.projectVersions[0]?.name,
          value: project.id,
        }))
        .at(0) ?? null,
    fundingDestinationUsageYears: usageYearsOptions(
      flow.usageYears.filter(
        (usageYear) => usageYear.flowObject.refDirection === 'destination'
      )
    ),
    fundingDestinationFieldClusters: flow.clusters
      .filter((cluster) => cluster.flowObject.refDirection === 'destination')
      .map((cluster) => ({
        displayLabel: cluster.governingEntityVersion.name,
        value: cluster.id,
      })),
  };

  const res = {} as FlowFormType;
  for (const key of keys) {
    res[key] = MAP_KEYS_TO_FIELDS[key] as FormObjectValue[] & FormObjectValue;
  }
  return res;
};

export const parseToFlowForm = (
  flow: flows.GetFlowResult,
  parents?: flows.GetFlowResult[],
  children?: flows.GetFlowResult[]
): FlowFormType => {
  const {
    amountUSD,
    description: flowDescription,
    origAmount,
    decisionDate,
    firstReportedDate,
    exchangeRate,
    flowDate,
    newMoney: isNewMoney,
    notes,
    restricted,
  } = flow;
  const flowForm: FlowFormType = {
    ...INITIAL_FORM_VALUES,
    ...categoriesToFlowForm(flow),
    ...flowObjectToFormObjectValue(flow, [
      'fundingSourceOrganizations',
      'fundingSourceLocations',
      'fundingSourceEmergencies',
      'fundingSourceGlobalClusters',
      'fundingSourcePlan',
      'fundingSourceProject',
      'fundingSourceUsageYears',
      'fundingSourceFieldClusters',
      'fundingDestinationOrganizations',
      'fundingDestinationLocations',
      'fundingDestinationEmergencies',
      'fundingDestinationGlobalClusters',
      'fundingDestinationPlan',
      'fundingDestinationProject',
      'fundingDestinationUsageYears',
      'fundingDestinationFieldClusters',
    ]),
    amountUSD,
    flowDescription,
    amountOriginalCurrency:
      origAmount ?? INITIAL_FORM_VALUES['amountOriginalCurrency'],
    childFlows: children ? children.map(flowToFlowLinkProps) : [],
    decisionDate: decisionDate
      ? new Date(decisionDate)
      : INITIAL_FORM_VALUES['decisionDate'],
    firstReported: firstReportedDate
      ? new Date(firstReportedDate)
      : INITIAL_FORM_VALUES['firstReported'],
    exchangeRate: exchangeRate ?? INITIAL_FORM_VALUES['exchangeRate'],
    flowDate: new Date(flowDate),
    isNewMoney,
    notes: notes ?? INITIAL_FORM_VALUES['notes'],
    parentFlow: parents?.[0] ? flowToFlowLinkProps(parents[0]) : null,
    restricted,
  };
  // TODO
  return flowForm;
};
