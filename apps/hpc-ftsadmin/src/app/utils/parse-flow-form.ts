import {
  FormObjectValue,
  categories,
  flows,
  reportFiles,
} from '@unocha/hpc-data';
import {
  INITIAL_FORM_VALUES,
  type FlowFormType,
  type FlowFormTypeValidated,
} from '../components/flow-form/flow-form';
import {
  currencyToInteger,
  fileAssetEntityToFileUploadResult,
  flowToFlowLinkProps,
  valueToInteger,
} from './map-functions';
import {
  FlowObjectTypes,
  encodeFilters,
  isFlowObjectTypes,
} from './parse-filters';
import {
  defaultOptions,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from './fn-promises';
import { ReportingDetailProps } from '../components/reporting-detail';
import dayjs from 'dayjs';
import { FlowLinkProps } from '../components/flow-form/flow-link';
import {
  FLOWS_FILTER_INITIAL_VALUES,
  FlowsFilterValues,
} from '../components/filters/filter-flows-table';
import { Environment } from '../../environments/interface';
import { THEME } from '@unocha/hpc-ui';
import { PENDING_REVIEW } from './constants';

type EntityName =
  | 'location'
  | 'emergency'
  | 'globalCluster'
  | 'organization'
  | 'plan'
  | 'project'
  | 'usageYear';

type FlowLinkPropsSerialized = Omit<FlowLinkProps, 'flowDate'> & {
  flowDate: string;
};
type ReportingDetailPropsSerialized = Omit<
  ReportingDetailProps,
  'dateReported'
> & {
  dateReported: string | null;
};
export type FlowFormTypeSerialized = Omit<
  FlowFormType,
  | 'flowDate'
  | 'decisionDate'
  | 'firstReported'
  | 'reportingDetails'
  | 'parentFlow'
  | 'childFlows'
> & {
  flowDate: string | null;
  decisionDate: string | null;
  firstReported: string | null;
  reportingDetails: ReportingDetailPropsSerialized[];
  parentFlow: FlowLinkPropsSerialized | null;
  childFlows: FlowLinkPropsSerialized[];
};

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

const TRANSFERRED_CHIP_COLOR = THEME.colors.pallete.blue.light;
const INFERRED_CHIP_COLOR = THEME.colors.pallete.orange.variant1;

const FUNDING_KEYS: FlowFormFlowObjectKey[] = [
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
];

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

const createReportFiles = (
  reportDetail: ReportingDetailProps
): reportFiles.CreateFile[] => {
  const reportFiles: reportFiles.CreateFile[] = [];

  if (reportDetail.file && reportDetail.reportFileTitle) {
    reportFiles.push({
      fileAssetID: reportDetail.file.id,
      title: reportDetail.reportFileTitle,
      type: 'file',
      url: null,
    });
  }
  if (reportDetail.reportURLTitle && reportDetail.url) {
    reportFiles.push({
      url: reportDetail.url,
      title: reportDetail.reportURLTitle,
      type: 'url',
      fileAssetID: null,
    });
  }
  return reportFiles;
};

const reportingDetailPropsToReportDetails = (
  reportDetailProps: ReportingDetailProps[],
  initialValues?: FlowFormType
): flows.CreateFlowParams['flow']['reportDetails'] => {
  return reportDetailProps.map(
    (reportDetail, index) =>
      ({
        contactInfo: reportDetail.reporterContactInfo,
        source: reportDetail.reportSource,
        date: reportDetail.dateReported
          ? reportDetail.dateReported.toISOString()
          : null,
        sourceID: reportDetail.sourceSystemRecordId
          ? valueToInteger(reportDetail.sourceSystemRecordId)
          : null,
        refCode: reportDetail.sourceSystemRecordId
          ? reportDetail.reporterReferenceCode
          : null,
        verified: reportDetail.verified === 'true',
        organizationID: reportDetail.reportedByOrganization
          ? valueToInteger(reportDetail.reportedByOrganization.value)
          : null,
        categories: [
          ...(reportDetail.reportChannel?.value
            ? [valueToInteger(reportDetail.reportChannel.value)]
            : []),
        ],
        newlyAdded:
          !!initialValues && index >= initialValues.reportingDetails.length,
        reportFiles: createReportFiles(reportDetail),
      }) satisfies flows.CreateFlowParams['flow']['reportDetails'][number]
  );
};
export const parseFlowForm = (
  values: FlowFormTypeValidated,
  inactiveReasons: categories.GetCategoriesResult,
  initialValues?: FlowFormType,
  isPending?: { isApproved?: boolean; isSaved?: boolean }
): flows.CreateFlowParams => {
  const {
    method,
    amountOriginalCurrency,
    amountUSD,
    beneficiaryGroup,
    contributionType,
    currency,
    decisionDate,
    donorBudgetYear,
    earmarkingType,
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
    reportingDetails,
    restricted,
  } = values;

  let pendingReviewCategory;
  let cancelledCategory;
  for (const inactiveReason of inactiveReasons) {
    if (inactiveReason.name === PENDING_REVIEW) {
      pendingReviewCategory = inactiveReason;
    }
    if (inactiveReason.name === 'Cancelled') {
      cancelledCategory = inactiveReason;
    }
  }

  const notes = dirtyNotes || undefined;
  const exchangeRate = dirtyExchangeRate || undefined;

  const categories = categoryIds([
    method,
    beneficiaryGroup,
    contributionType,
    earmarkingType,
    flowStatus,
    flowType,
    ...keywords,
  ]);
  const inactiveReason = [];
  if (isPending?.isSaved && pendingReviewCategory) {
    categories.push(pendingReviewCategory.id);
    inactiveReason.push(pendingReviewCategory);
  }
  if (isInactive && cancelledCategory) {
    categories.push(cancelledCategory.id);
    inactiveReason.push(cancelledCategory);
  }

  const flowObjects = getFundingValues(values).flatMap((key) =>
    extractDirectionObject(key, values)
  );

  const flow: flows.CreateFlowParams['flow'] = {
    activeStatus: !isInactive || !!isPending?.isApproved,
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
    isErrorCorrection:
      isErrorCorrection || isPending?.isApproved || isPending?.isSaved,
    isApprovedFlowVersion: isPending?.isApproved || isPending?.isSaved,
    inactiveReason,
    newCategories: [], //  TODO
    newMoney,
    notes,
    origAmount: currencyToInteger(amountOriginalCurrency),
    origCurrency: currency?.value.toString() ?? null,
    parents: values.parentFlow ? [{ parentID: values.parentFlow.id }] : [],
    reportDetails: reportingDetailPropsToReportDetails(
      reportingDetails,
      initialValues
    ),
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
    'earmarkingType',
    'contributionType',
    'method',
    'beneficiaryGroup',
  ].includes(group);
};

const categoriesToFlowForm = (values: flows.GetFlowResult) => {
  return values.categories.reduce((acc, { group, id, name }) => {
    if (group === 'keywords') {
      return {
        ...acc,
        [group]: [...(acc.keywords ?? []), { displayLabel: name, value: id }],
      };
    } else if (isCategoryGroupKeyFlowForm(group)) {
      return { ...acc, [group]: { displayLabel: name, value: id } };
    }
    return acc;
  }, {} as FlowFormType);
};

const isInferred = (
  flow: flows.GetFlowResult,
  entity: { id: number },
  direction: 'source' | 'destination',
  entityName: EntityName
) => {
  if (flow.externalReferences.length === 0) {
    return false;
  }

  const inferredList = flow.externalReferences.map((eR) => {
    if (!eR.importInformation.inferred) {
      return false;
    }
    return eR.importInformation.inferred.some(
      (inf) =>
        inf.key.includes(direction) &&
        inf.key.includes(entityName) &&
        inf.valueId === entity.id
    );
  });
  return inferredList.some((inf) => inf === true);
};

const isTransferred = (
  flow: flows.GetFlowResult,
  entity: { id: number },
  direction: 'source' | 'destination',
  entityName: EntityName
) => {
  if (flow.externalReferences.length === 0) {
    return false;
  }

  const transferredList = flow.externalReferences.map((eR) => {
    if (!eR.importInformation.transferred) {
      return false;
    }
    return eR.importInformation.transferred.some(
      (inf) =>
        inf.key.includes(direction) &&
        inf.key.includes(entityName) &&
        inf.valueId === entity.id
    );
  });

  return transferredList.some((trans) => trans === true);
};

const inferredTransferredChipColor = (
  flow: flows.GetFlowResult,
  entity: {
    id: number;
    flowObject: { refDirection: 'source' | 'destination' };
  },
  entityName: EntityName
) => {
  if (isInferred(flow, entity, entity.flowObject.refDirection, entityName)) {
    return { chipColor: INFERRED_CHIP_COLOR, tooltip: 'Inferred' };
  }
  if (isTransferred(flow, entity, entity.flowObject.refDirection, entityName)) {
    return { chipColor: TRANSFERRED_CHIP_COLOR, tooltip: 'Transferred' };
  }

  return {};
};

const flowObjectToFormObjectValue = (
  flow: flows.GetFlowResult,
  keys: FlowFormFlowObjectKey[],
  parent?: flows.GetFlowResult
): FlowFormType => {
  const sourceFlow = parent ?? flow;
  const MAP_KEYS_TO_FIELDS: Record<
    FlowFormFlowObjectKey,
    FlowFormType[FlowFormFlowObjectKey]
  > = {
    fundingSourceOrganizations: organizationsOptions(
      sourceFlow.organizations
        .filter((org) => org.flowObject.refDirection === 'source')
        .map((org) => ({
          ...org,
          ...inferredTransferredChipColor(flow, org, 'organization'),
        }))
    ),
    fundingSourceLocations: locationsOptions(
      sourceFlow.locations
        .filter((loc) => loc.flowObject.refDirection === 'source')
        .map((loc) => ({
          ...loc,
          ...inferredTransferredChipColor(flow, loc, 'location'),
        }))
    ),
    fundingSourceEmergencies: defaultOptions(
      sourceFlow.emergencies
        .filter((emergency) => emergency.flowObject.refDirection === 'source')
        .map((emergency) => ({
          ...emergency,
          ...inferredTransferredChipColor(flow, emergency, 'emergency'),
        }))
    ),
    fundingSourceGlobalClusters: defaultOptions(
      sourceFlow.globalClusters
        .filter((gC) => gC.flowObject.refDirection === 'source')
        .map((gC) => ({
          ...gC,
          ...inferredTransferredChipColor(flow, gC, 'globalCluster'),
        }))
    ),
    fundingSourcePlan:
      sourceFlow.plans
        .filter((plan) => plan.flowObject.refDirection === 'source')
        .map((plan) => ({
          displayLabel: plan.planVersion.name,
          value: plan.id,
        }))
        .at(0) ?? null,
    fundingSourceProject:
      sourceFlow.projects
        .filter((project) => project.flowObject.refDirection === 'source')
        .map((project) => ({
          displayLabel: project.projectVersions[0]?.name,
          value: project.id,
        }))
        .at(0) ?? null,
    fundingSourceUsageYears: usageYearsOptions(
      sourceFlow.usageYears
        .filter((usageYear) => usageYear.flowObject.refDirection === 'source')
        .map((usageYear) => ({
          ...usageYear,
          ...inferredTransferredChipColor(flow, usageYear, 'usageYear'),
        }))
    ),
    fundingSourceFieldClusters: sourceFlow.clusters
      .filter((cluster) => cluster.flowObject.refDirection === 'source')
      .map((cluster) => ({
        displayLabel: cluster.governingEntityVersion.name,
        value: cluster.id,
      })),
    fundingDestinationOrganizations: organizationsOptions(
      flow.organizations
        .filter((org) => org.flowObject.refDirection === 'destination')
        .map((org) => ({
          ...org,
          ...inferredTransferredChipColor(flow, org, 'organization'),
        }))
    ),
    fundingDestinationLocations: locationsOptions(
      flow.locations
        .filter((loc) => loc.flowObject.refDirection === 'destination')
        .map((loc) => ({
          ...loc,
          ...inferredTransferredChipColor(flow, loc, 'location'),
        }))
    ),
    fundingDestinationEmergencies: defaultOptions(
      flow.emergencies
        .filter(
          (emergency) => emergency.flowObject.refDirection === 'destination'
        )
        .map((emergency) => ({
          ...emergency,
          ...inferredTransferredChipColor(flow, emergency, 'emergency'),
        }))
    ),
    fundingDestinationGlobalClusters: defaultOptions(
      flow.globalClusters
        .filter((gC) => gC.flowObject.refDirection === 'destination')
        .map((gC) => ({
          ...gC,
          ...inferredTransferredChipColor(flow, gC, 'globalCluster'),
        }))
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
      flow.usageYears
        .filter(
          (usageYear) => usageYear.flowObject.refDirection === 'destination'
        )
        .map((usageYear) => ({
          ...usageYear,
          ...inferredTransferredChipColor(flow, usageYear, 'usageYear'),
        }))
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

const reportDetailsToReportingDetailProps = (
  reportDetails: flows.GetFlowResult['reportDetails']
): ReportingDetailProps[] => {
  return reportDetails.map((reportDetail) => ({
    reportSource: reportDetail.source,
    reportedByOrganization: {
      displayLabel: reportDetail.organization.name,
      value: reportDetail.organization.id,
    },
    reportChannel: {
      displayLabel: reportDetail.categories[0]?.name,
      value: reportDetail.categories[0]?.id,
    },
    sourceSystemRecordId: reportDetail.id.toString(),
    verified: reportDetail.verified.toString(),
    dateReported: reportDetail.date ? dayjs(reportDetail.date) : null,
    reporterReferenceCode: reportDetail.refCode ?? '',
    reporterContactInfo: reportDetail.contactInfo ?? '',
    reportFileTitle:
      reportDetail.reportFiles.find((rF) => rF.type === 'file')?.title ?? '',
    file: fileAssetEntityToFileUploadResult(
      reportDetail.reportFiles.find((rF) => rF.type === 'file')?.fileAssetEntity
    ),
    reportURLTitle:
      reportDetail.reportFiles.find((rF) => rF.type.toLowerCase() === 'url')
        ?.title ?? '',
    url:
      reportDetail.reportFiles.find((rF) => rF.type.toLowerCase() === 'url')
        ?.url ?? '',
  }));
};

export const parseToFlowForm = (
  flow: flows.GetFlowResult,
  parents?: flows.GetFlowResult[],
  children?: flows.GetFlowResult[]
): FlowFormType => {
  const {
    activeStatus,
    amountUSD,
    description: flowDescription,
    origAmount,
    origCurrency,
    decisionDate,
    firstReportedDate,
    exchangeRate,
    flowDate,
    newMoney: isNewMoney,
    notes,
    reportDetails,
    restricted,
  } = flow;
  const flowForm: FlowFormType = {
    ...INITIAL_FORM_VALUES,
    ...categoriesToFlowForm(flow),
    ...flowObjectToFormObjectValue(flow, FUNDING_KEYS, parents?.[0]),
    amountUSD,
    flowDescription,
    amountOriginalCurrency:
      origAmount ?? INITIAL_FORM_VALUES['amountOriginalCurrency'],
    currency: origCurrency
      ? { value: origCurrency, displayLabel: origCurrency }
      : INITIAL_FORM_VALUES['currency'],
    childFlows: children ? children.map(flowToFlowLinkProps) : [],
    decisionDate: decisionDate
      ? dayjs(decisionDate)
      : INITIAL_FORM_VALUES['decisionDate'],
    firstReported: firstReportedDate
      ? dayjs(firstReportedDate)
      : INITIAL_FORM_VALUES['firstReported'],
    exchangeRate: exchangeRate ?? INITIAL_FORM_VALUES['exchangeRate'],
    flowDate: dayjs(flowDate),
    isInactive: !activeStatus,
    isNewMoney,
    notes: notes ?? INITIAL_FORM_VALUES['notes'],
    parentFlow: parents?.[0] ? flowToFlowLinkProps(parents[0]) : null,
    reportingDetails: reportDetailsToReportingDetailProps(reportDetails),
    restricted,
  };
  return flowForm;
};

/**
 * Using `DayJS` classes cant directly be serialized to JSON,
 * so we need to convert them to strings.
 * This function is used to copy flows.
 * **ATTENTION:**`sourceSystemRecordId` is set to empty string.
 */
export const serializeFlowForm = (
  values: FlowFormType
): FlowFormTypeSerialized => {
  const {
    flowDate,
    decisionDate,
    firstReported,
    reportingDetails,
    parentFlow,
    ...restValues
  } = values;

  return {
    ...restValues,
    flowDate: flowDate?.isValid() ? flowDate.toISOString() : null,
    decisionDate: decisionDate?.isValid() ? decisionDate.toISOString() : null,
    firstReported: firstReported?.isValid()
      ? firstReported.toISOString()
      : null,
    parentFlow: parentFlow
      ? { ...parentFlow, flowDate: parentFlow.flowDate.toISOString() }
      : null,
    childFlows: values.childFlows.map((childFlow) => ({
      ...childFlow,
      flowDate: childFlow.flowDate.toISOString(),
    })),
    reportingDetails: reportingDetails.map((reportingDetail) => ({
      ...reportingDetail,
      dateReported: reportingDetail.dateReported?.isValid()
        ? reportingDetail.dateReported?.toISOString()
        : null,
      sourceSystemRecordId: '',
    })),
  };
};

export const deserializeFlowForm = (
  values: FlowFormTypeSerialized
): FlowFormType => {
  const {
    flowDate,
    decisionDate,
    firstReported,
    reportingDetails,
    parentFlow,
  } = values;

  return {
    ...values,
    flowDate: flowDate ? dayjs(flowDate) : null,
    decisionDate: decisionDate ? dayjs(decisionDate) : null,
    firstReported: firstReported ? dayjs(firstReported) : null,
    parentFlow: parentFlow
      ? { ...parentFlow, flowDate: dayjs(parentFlow.flowDate) }
      : null,
    childFlows: values.childFlows.map((childFlow) => ({
      ...childFlow,
      flowDate: dayjs(childFlow.flowDate),
    })),
    reportingDetails: reportingDetails.map((reportingDetail) => ({
      ...reportingDetail,
      dateReported: reportingDetail.dateReported
        ? dayjs(reportingDetail.dateReported)
        : null,
    })),
  };
};

const flowFormToFlowsFilterValues = async (
  values: FlowFormType,
  env: Environment
): Promise<FlowsFilterValues> => {
  const res: FlowsFilterValues = {};
  const plans = values.fundingDestinationPlan?.value
    ? await env.model.plans
        .getAutocompletePlansById({
          id: valueToInteger(values.fundingDestinationPlan.value),
        })
        .then((res) =>
          res.map((plan) => ({
            displayLabel: `Plan ID: ${plan.id}`,
            value: plan.id,
          }))
        )
    : null;

  res.includeChildrenOfParkedFlows = true;

  res.sourceLocations = values.fundingSourceLocations;
  res.sourceOrganizations = values.fundingSourceOrganizations;

  res.destinationOrganizations = values.fundingDestinationOrganizations;
  res.destinationPlans =
    plans ??
    (values.fundingDestinationPlan
      ? [values.fundingDestinationPlan]
      : undefined);

  return res;
};

export const queryParamsFlowFilter = async (
  flowFormValues: FlowFormType,
  env: Environment
): Promise<string> => {
  const flowsFilterValues = await flowFormToFlowsFilterValues(
    flowFormValues,
    env
  );
  const paramsObject: Record<string, string> = {
    orderBy: 'flow.updatedAt',
    orderDir: 'DESC',
    page: '0',
    rowsPerPage: '50',
    filters: JSON.stringify(
      encodeFilters(flowsFilterValues, FLOWS_FILTER_INITIAL_VALUES)
    ),
  };

  const params = new URLSearchParams(paramsObject);
  return params.toString();
};

/**
 *  It returns the values that differ from both flows with
 *  the values from the incoming flow
 */
const compareFlowForms = (
  currentFlow: FlowFormType,
  incomingFlow: FlowFormType
): Partial<FlowFormType> => {
  const result: Partial<FlowFormType> = {};
  const isDifferentFormObjectValue = (
    currentValue: FormObjectValue | null,
    incomingValue: FormObjectValue | null
  ) => {
    if (currentValue === incomingValue) return false;
    if ((!currentValue && incomingValue) || (currentValue && !incomingValue))
      return true;
    return currentValue?.value !== incomingValue?.value;
  };

  const isDifferentDayjs = (
    currentDate: dayjs.Dayjs | null,
    incomingDate: dayjs.Dayjs | null
  ): boolean => {
    if (currentDate === incomingDate) return false;
    if ((!currentDate && incomingDate) || (currentDate && !incomingDate))
      return true;
    return !currentDate?.isSame(incomingDate);
  };

  const isDifferentArray = <T>(
    currentArray: T[],
    incomingArray: T[],
    comparator: (a: T, b: T) => boolean
  ) => {
    if (currentArray.length === 0 && incomingArray.length === 0) return false;
    if (currentArray.length !== incomingArray.length) return true;

    for (const item of currentArray) {
      if (!incomingArray.some((i) => comparator(item, i))) {
        return false;
      }
    }
    return true;
  };
  let typedKey: keyof FlowFormType;
  for (typedKey in currentFlow) {
    const key = typedKey;
    switch (key) {
      // For FormObjectValue[]
      case 'fundingSourceOrganizations':
      case 'fundingSourceUsageYears':
      case 'fundingSourceLocations':
      case 'fundingSourceEmergencies':
      case 'fundingSourceGlobalClusters':
      case 'fundingSourceFieldClusters':
      case 'fundingDestinationOrganizations':
      case 'fundingDestinationUsageYears':
      case 'fundingDestinationLocations':
      case 'fundingDestinationEmergencies':
      case 'fundingDestinationGlobalClusters':
      case 'fundingDestinationFieldClusters':
      case 'keywords': {
        const currentValue = currentFlow[key];
        const incomingValue = incomingFlow[key];
        if (
          isDifferentArray(
            currentValue,
            incomingValue,
            isDifferentFormObjectValue
          )
        ) {
          result[key] = incomingValue;
        }
        break;
      }
      // For FormObjectValue | null
      case 'fundingSourceProject':
      case 'fundingSourcePlan':
      case 'fundingDestinationProject':
      case 'fundingDestinationPlan':
      case 'currency':
      case 'flowType':
      case 'flowStatus':
      case 'contributionType':
      case 'earmarkingType':
      case 'method':
      case 'beneficiaryGroup': {
        const currentValue = currentFlow[key];
        const incomingValue = incomingFlow[key];
        if (isDifferentFormObjectValue(currentValue, incomingValue)) {
          result[key] = incomingValue;
        }
        break;
      }

      // For Dayjs dates
      case 'firstReported':
      case 'decisionDate':
      case 'flowDate': {
        const currentValue = currentFlow[key];
        const incomingValue = incomingFlow[key];
        if (isDifferentDayjs(currentValue, incomingValue)) {
          result[key] = incomingValue;
        }
        break;
      }
      // For primitive or direct comparisons
      case 'isNewMoney':
      case 'restricted': {
        const currentValue = currentFlow[key];
        const incomingValue = incomingFlow[key];
        if (currentValue !== incomingValue) {
          result[key] = incomingValue;
        }
        break;
      }
      case 'amountUSD':
      case 'amountOriginalCurrency':
      case 'exchangeRate':
      case 'flowDescription':
      case 'donorBudgetYear':
      case 'notes': {
        const currentValue = currentFlow[key];
        const incomingValue = incomingFlow[key];
        if (currentValue !== incomingValue) {
          result[key] = incomingValue;
        }
        break;
      }
      default:
        break;
    }
  }
  return result;
};

const isFundingKey = (key: string): key is FlowFormFlowObjectKey =>
  FUNDING_KEYS.some((k) => k === key);

export const pendingValuesFlowForm = (
  initialValues?: FlowFormType,
  flow?: flows.GetFlowResult
): Partial<FlowFormType> | null => {
  if (!flow || !initialValues) {
    return null;
  }
  const MAP_SINGULAR_TO_KEY: Record<string, string> = {
    organization: 'Organizations',
    location: 'Locations',
    emergency: 'Emergencies',
    globalCluster: 'GlobalClusters',
    plan: 'Plan',
    project: 'Project',
    usageYear: 'UsageYears',
    fieldCluster: 'FieldClusters',
  };

  const comparedFlow = compareFlowForms(initialValues, parseToFlowForm(flow));
  for (const eD of flow.externalData) {
    const key = `funding${
      eD.refDirection === 'destination' ? 'Destination' : 'Source'
    }${MAP_SINGULAR_TO_KEY[eD.objectType]}`;
    if (isFundingKey(key)) {
      // Even though types mismatch, when this values is passed
      // to any pending review component, it will check if types
      // mismatch and will show a warning.
      comparedFlow[key] = eD.data as any;
    }
  }
  return comparedFlow;
};
