import {
  type categories,
  type flowObjects,
  type flows,
  type reportFiles,
  type util,
} from '@unocha/hpc-data';
import { THEME } from '@unocha/hpc-ui';
import { type Environment } from '../../environments/interface';
import dayjs from '../../libs/dayjs';
import {
  FLOWS_FILTER_INITIAL_VALUES,
  type FlowsFilterValues,
} from '../components/filters/filter-flows-table';
import {
  INITIAL_FORM_VALUES,
  type FlowFormType,
  type FlowFormTypeValidated,
} from '../components/flow-form/flow-form';
import { type FlowLinkProps } from '../components/flow-form/flow-link';
import { type ReportingDetailProps } from '../components/reporting-detail';
import { PENDING_REVIEW } from './constants';
import {
  defaultOptions,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from './fn-promises';
import {
  currencyToInteger,
  fileAssetEntityToFileUploadResult,
  flowToFlowLinkProps,
  valueToFloat,
  valueToInteger,
} from './map-functions';
import {
  encodeFilters,
  isFlowObjectTypes,
  type FlowObjectTypes,
} from './parse-filters';

type EntityName =
  | 'location'
  | 'emergency'
  | 'globalCluster'
  | 'organization'
  | 'anonymizedOrganization'
  | 'plan'
  | 'project'
  | 'usageYear';

type FlowLinkPropsSerialized = Omit<FlowLinkProps, 'flowDate'> & {
  flowDate: string | null;
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
  // When copying a flow, `childFlows`, `amountUSD` and `amountOriginalCurrency` are not included
  | 'childFlows'
  | 'amountUSD'
  | 'amountOriginalCurrency'
> & {
  flowDate: string | null;
  decisionDate: string | null;
  firstReported: string | null;
  reportingDetails: ReportingDetailPropsSerialized[];
  parentFlow: FlowLinkPropsSerialized | null;
};

export type RefDirection = 'source' | 'destination';

type CreateFlowObject = Pick<
  flowObjects.FlowObject,
  'objectID' | 'objectType' | 'behavior' | 'refDirection'
>;

const TRANSFERRED_CHIP_COLOR = THEME.colors.pallete.blue.light;
const INFERRED_CHIP_COLOR = THEME.colors.pallete.orange.variant1;

export const FUNDING_KEYS = [
  'fundingSourceOrganizations',
  'fundingSourceLocations',
  'fundingSourceEmergencies',
  'fundingSourceGlobalClusters',
  'fundingSourcePlan',
  'fundingSourceProject',
  'fundingSourceUsageYears',
  'fundingSourceFieldClusters',
  'fundingDestinationOrganizations',
  'fundingDestinationAnonymizedOrganizations',
  'fundingDestinationLocations',
  'fundingDestinationEmergencies',
  'fundingDestinationGlobalClusters',
  'fundingDestinationPlan',
  'fundingDestinationProject',
  'fundingDestinationUsageYears',
  'fundingDestinationFieldClusters',
] as const;
export type FlowFormFlowObjectKey = (typeof FUNDING_KEYS)[number];

export const SHARED_FIELDS = new Set<string>([
  'fundingSourceOrganizations',
  'fundingSourceLocations',
  'fundingSourceGlobalClusters',
  'fundingSourceUsageYears',
  'fundingSourceFieldClusters',
  'fundingSourcePlan',
  'fundingDestinationOrganizations',
  'fundingDestinationLocations',
  'fundingDestinationGlobalClusters',
  'fundingDestinationUsageYears',
  'fundingDestinationFieldClusters',
  'fundingDestinationPlan',
] satisfies FlowFormFlowObjectKey[]);

const OVERLAP_FIELDS = new Set<string>([
  'fundingSourceEmergencies',
  'fundingSourceProject',
  'fundingDestinationEmergencies',
  'fundingDestinationProject',
] satisfies FlowFormFlowObjectKey[]);

export const CTP = 'Cash transfer programming (CTP)' as const;
export const isMethodOption = (value: util.FormObjectValue) =>
  value.displayLabel === 'Traditional aid' || value.displayLabel === CTP;

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

export const isFormObjectValue = (
  value: unknown
): value is util.FormObjectValue =>
  typeof value === 'object' &&
  !Array.isArray(value) &&
  value !== null &&
  Object.keys(value).includes('displayLabel') &&
  Object.keys(value).includes('value');

const isArrayFormObjectValue = (
  value: unknown
): value is util.FormObjectValue[] => {
  return (
    Array.isArray(value) && (isFormObjectValue(value[0]) || value.length === 0)
  );
};

const createFlowObject = ({
  direction,
  lowerCaseSingularObject,
  value,
  behavior,
}: {
  direction: string;
  lowerCaseSingularObject: FlowObjectTypes;
  value: util.FormObjectValue;
  behavior: CreateFlowObject['behavior'];
}): CreateFlowObject => {
  const flowObject = {
    objectID: valueToInteger(value.value),
    objectType: lowerCaseSingularObject,
    behavior,
  } satisfies Partial<CreateFlowObject>;
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
): CreateFlowObject[] => {
  const match = key.match(
    /^(fundingSource|fundingDestination)(Locations|Emergencies|GlobalClusters|Organizations|AnonymizedOrganizations|Plan|Project|UsageYears|FieldClusters)$/
  );

  if (match && values[key] !== null) {
    let singularObject =
      match[2] === 'FieldClusters'
        ? 'governingEntity'
        : match[2].replace(/ies$/, 'y');
    singularObject = singularObject.replace(/s$/, '');
    const direction = match[1];
    const lowerCaseSingularObject =
      singularObject.charAt(0).toLowerCase() + singularObject.slice(1);

    if (!isFlowObjectTypes(lowerCaseSingularObject)) {
      return [];
    }
    const value = values[key];
    if (isArrayFormObjectValue(value)) {
      const areFlowObjectsShared = SHARED_FIELDS.has(key) && value.length > 1;
      const areFlowObjectsOverlap = OVERLAP_FIELDS.has(key) && value.length > 1;
      const behavior = (
        areFlowObjectsShared
          ? 'shared'
          : areFlowObjectsOverlap
          ? 'overlap'
          : null
      ) satisfies CreateFlowObject['behavior'];

      return value.map((formObjectValue) =>
        createFlowObject({
          direction,
          lowerCaseSingularObject,
          value: formObjectValue,
          behavior,
        })
      );
    } else if (isFormObjectValue(value)) {
      return [
        createFlowObject({
          direction,
          lowerCaseSingularObject,
          value,
          behavior: null,
        }),
      ];
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
          ? reportDetail.dateReported.toDate()
          : null,
        sourceID: reportDetail.sourceSystemRecordId,
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
  flowTypes: util.FormObjectValue[],
  initialValues?: FlowFormType,
  isPending?: { isApproved?: boolean; isSaved?: boolean }
): flows.CreateFlowParams => {
  const {
    method,
    childMethod,
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
    flowType: unprocessedFlowType,
    isNewMoney,
    isErrorCorrection,
    isInactive,
    keywords,
    notes: dirtyNotes,
    childFlows,
    reportingDetails,
    isRestricted,
    parentFlow,
  } = values;

  const pendingReviewCategory = inactiveReasons.find(
    (inactiveReason) => inactiveReason.name === PENDING_REVIEW
  );
  const cancelledCategory = inactiveReasons.find(
    (inactiveReason) => inactiveReason.name === 'Cancelled'
  );

  const notes = dirtyNotes || undefined;
  const exchangeRate = dirtyExchangeRate || undefined;

  const parked = flowTypes.find((ft) => ft.displayLabel === 'Parked');
  //  Flows that are parent flows, are always parked
  const flowType =
    parked && childFlows.length > 0 ? parked : unprocessedFlowType;

  const categories = categoryIds([
    method,
    childMethod,
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
  if (isInactive && cancelledCategory && !isPending?.isApproved) {
    categories.push(cancelledCategory.id);
    inactiveReason.push(cancelledCategory);
  }

  const flowObjects = getFundingValues(values).flatMap((key) =>
    extractDirectionObject(key, values)
  );

  const flow: flows.CreateFlowParams['flow'] = {
    activeStatus: !isInactive || !!isPending?.isApproved,
    amountUSD: currencyToInteger(amountUSD),
    budgetYear:
      donorBudgetYear !== '' ? valueToInteger(donorBudgetYear) : undefined,
    categories,
    children: childFlows.map((childFlow) => ({ childID: childFlow.id })),
    decisionDate: decisionDate?.toDate() ?? null,
    description,
    exchangeRate: exchangeRate ? valueToFloat(exchangeRate) : null,
    firstReportedDate: firstReported.toDate(),
    flowDate: flowDate.toDate(),
    flowObjects,
    isCancellation: null, //  TODO
    isErrorCorrection:
      isErrorCorrection || !!isPending?.isApproved || isPending?.isSaved,
    isApprovedFlowVersion: !!isPending?.isApproved || isPending?.isSaved,
    inactiveReason,
    newCategories: [], //  TODO
    newMoney: isNewMoney,
    notes,
    origAmount: amountOriginalCurrency
      ? currencyToInteger(amountOriginalCurrency)
      : null,
    origCurrency: currency?.value.toString() ?? null,
    parents: parentFlow ? [{ parentID: parentFlow.id }] : [],
    reportDetails: reportingDetailPropsToReportDetails(
      reportingDetails,
      initialValues
    ),
    restricted: isRestricted,
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
      const parsedValue: util.FormObjectValue = {
        displayLabel: name,
        value: id,
      };
      if (group === 'method' && !isMethodOption(parsedValue)) {
        return { ...acc, childMethod: parsedValue };
      }
      return { ...acc, [group]: parsedValue };
    }
    return acc;
  }, {} as FlowFormType);
};

const isInferred = (
  flow: flows.GetFlowResult,
  entity: { id: number },
  direction: RefDirection,
  entityName: EntityName
) => {
  if (flow.externalReferences.length === 0) {
    return false;
  }

  const inferredList = flow.externalReferences.map((eR) => {
    if (!eR.importInformation?.inferred) {
      return false;
    }
    return eR.importInformation.inferred.some(
      (inf) =>
        inf.key.includes(direction) &&
        inf.key.includes(entityName) &&
        inf.valueId === entity.id
    );
  });
  return inferredList.includes(true);
};

const isTransferred = (
  flow: flows.GetFlowResult,
  entity: { id: number },
  direction: RefDirection,
  entityName: EntityName
) => {
  if (flow.externalReferences.length === 0) {
    return false;
  }

  const transferredList = flow.externalReferences.map((eR) => {
    if (!eR.importInformation?.transferred) {
      return false;
    }
    return eR.importInformation.transferred.some(
      (inf) =>
        inf.key.includes(direction) &&
        inf.key.includes(entityName) &&
        inf.valueId === entity.id
    );
  });

  return transferredList.includes(true);
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
  keys: readonly FlowFormFlowObjectKey[],
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
    fundingSourcePlan: sourceFlow.plans
      .filter((plan) => plan.flowObject.refDirection === 'source')
      .map((plan) => ({
        displayLabel: plan.planVersion.name,
        value: plan.id,
        ...inferredTransferredChipColor(flow, plan, 'plan'),
      })),
    fundingSourceProject: sourceFlow.projects
      .filter((project) => project.flowObject.refDirection === 'source')
      .map((project) => ({
        displayLabel: project.projectVersions[0]?.name,
        value: project.id,
        ...inferredTransferredChipColor(flow, project, 'project'),
      })),
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
    fundingDestinationAnonymizedOrganizations: organizationsOptions(
      flow.anonymizedOrganizations
        .filter((org) =>
          flow.flowObjects.some(
            (flowObject) =>
              flowObject.objectID === org.id &&
              flowObject.refDirection === 'destination'
          )
        )
        .map((org) => ({
          ...org,
          ...inferredTransferredChipColor(
            flow,
            { ...org, flowObject: { refDirection: 'destination' } },
            'anonymizedOrganization'
          ),
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
    fundingDestinationPlan: flow.plans
      .filter((plan) => plan.flowObject.refDirection === 'destination')
      .map((plan) => ({
        displayLabel: plan.planVersion.name,
        value: plan.id,
        ...inferredTransferredChipColor(flow, plan, 'plan'),
      })),
    fundingDestinationProject: flow.projects
      .filter((project) => project.flowObject.refDirection === 'destination')
      .map((project) => ({
        displayLabel: project.projectVersions[0]?.name,
        value: project.id,
        ...inferredTransferredChipColor(flow, project, 'project'),
      })),
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
    res[key] = MAP_KEYS_TO_FIELDS[key] as util.FormObjectValue[] &
      util.FormObjectValue;
  }
  return res;
};

const reportDetailsToReportingDetailProps = (
  reportDetails: flows.GetFlowResult['reportDetails']
): ReportingDetailProps[] => {
  return reportDetails.map((reportDetail) => ({
    reportSource: reportDetail.source,
    reportedByOrganization: reportDetail.organization
      ? {
          displayLabel: reportDetail.organization.name,
          value: reportDetail.organization.id,
        }
      : null,
    reportChannel: {
      displayLabel: reportDetail.categories[0]?.name,
      value: reportDetail.categories[0]?.id,
    },
    sourceSystemRecordId: reportDetail.sourceID ?? '',
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
    activeStatus: isActiveStatus,
    amountUSD,
    description,
    origAmount,
    origCurrency,
    decisionDate,
    firstReportedDate,
    exchangeRate,
    flowDate,
    newMoney: isNewMoney,
    notes,
    reportDetails,
    restricted: isRestricted,
  } = flow;
  const flowForm: FlowFormType = {
    ...INITIAL_FORM_VALUES,
    ...categoriesToFlowForm(flow),
    ...flowObjectToFormObjectValue(flow, FUNDING_KEYS, parents?.[0]),
    amountUSD: `${amountUSD}`,
    flowDescription: description ?? '',
    amountOriginalCurrency: `${
      origAmount ?? INITIAL_FORM_VALUES['amountOriginalCurrency']
    }`,
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
    exchangeRate:
      exchangeRate?.toString() ?? INITIAL_FORM_VALUES['exchangeRate'],
    flowDate: flowDate ? dayjs(flowDate) : INITIAL_FORM_VALUES['flowDate'],
    isInactive: !isActiveStatus,
    isNewMoney,
    notes: notes ?? INITIAL_FORM_VALUES['notes'],
    parentFlow: parents?.at(0) ? flowToFlowLinkProps(parents[0]) : null,
    reportingDetails: reportDetailsToReportingDetailProps(reportDetails),
    isRestricted,
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
    amountUSD: _amountUSD,
    amountOriginalCurrency: _amountOriginalCurrency,
    childFlows: _childFlows,
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
      ? {
          ...parentFlow,
          flowDate: parentFlow.flowDate?.isValid()
            ? parentFlow.flowDate.toISOString()
            : null,
        }
      : null,
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
    amountUSD: INITIAL_FORM_VALUES['amountUSD'],
    amountOriginalCurrency: INITIAL_FORM_VALUES['amountOriginalCurrency'],
    flowDate: flowDate ? dayjs(flowDate) : null,
    decisionDate: decisionDate ? dayjs(decisionDate) : null,
    firstReported: firstReported ? dayjs(firstReported) : null,
    parentFlow: parentFlow
      ? { ...parentFlow, flowDate: dayjs(parentFlow.flowDate) }
      : null,
    childFlows: [],
    reportingDetails: reportingDetails.map((reportingDetail) => ({
      ...reportingDetail,
      dateReported: reportingDetail.dateReported
        ? dayjs(reportingDetail.dateReported)
        : null,
    })),
  };
};

const extractToPureFormObjectValue = (
  value: util.FormObjectValue[]
): util.FormObjectValue[] => {
  return value.map(
    ({ chipColor: _chipColor, tooltip: _tooltip, ...otherProps }) => ({
      ...otherProps,
    })
  );
};

const flowFormToFlowsFilterValues = async (
  {
    fundingDestinationPlan,
    fundingSourceLocations,
    fundingSourceOrganizations,
    fundingDestinationOrganizations,
  }: FlowFormType,
  env: Environment
): Promise<FlowsFilterValues> => {
  const destinationPlans = fundingDestinationPlan?.at(0)?.value
    ? await env.model.plans
        .getPlan({
          id: valueToInteger(fundingDestinationPlan[0].value),
          scopes: ['planVersion'],
        })
        .then((plan): [util.FormObjectValue] => [
          {
            displayLabel: plan.planVersion.name,
            value: plan.id,
          },
        ])
    : fundingDestinationPlan;

  return {
    includeChildrenOfParkedFlows: true,
    sourceLocations: extractToPureFormObjectValue(fundingSourceLocations),
    sourceOrganizations: extractToPureFormObjectValue(
      fundingSourceOrganizations
    ),
    destinationOrganizations: extractToPureFormObjectValue(
      fundingDestinationOrganizations
    ),
    destinationPlans,
  };
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
    filters: encodeFilters(flowsFilterValues, FLOWS_FILTER_INITIAL_VALUES),
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
    currentValue: util.FormObjectValue | null,
    incomingValue: util.FormObjectValue | null
  ) => {
    if ((!currentValue && incomingValue) || (currentValue && !incomingValue)) {
      return true;
    }
    return currentValue?.value !== incomingValue?.value;
  };

  const isDifferentDayjs = (
    currentDate: dayjs.Dayjs | null,
    incomingDate: dayjs.Dayjs | null
  ): boolean => {
    if (currentDate === incomingDate) {
      return false;
    }
    if ((!currentDate && incomingDate) || (currentDate && !incomingDate)) {
      return true;
    }
    return !currentDate?.isSame(incomingDate, 'day');
  };

  const isDifferentArray = <T>(
    currentArray: T[],
    incomingArray: T[],
    comparator: (a: T, b: T) => boolean
  ) => {
    if (currentArray.length === 0 && incomingArray.length === 0) {
      return false;
    }
    if (currentArray.length !== incomingArray.length) {
      return true;
    }

    for (const item of currentArray) {
      if (!incomingArray.some((i) => !comparator(item, i))) {
        return true;
      }
    }
    return false;
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
      case 'fundingSourceProject':
      case 'fundingSourcePlan': {
        const currentValue = currentFlow[key];
        const incomingValue = incomingFlow[key];
        if (
          isDifferentArray(
            currentValue,
            incomingValue,
            isDifferentFormObjectValue
          ) &&
          !currentFlow.parentFlow
        ) {
          result[key] = incomingValue;
        }
        break;
      }
      case 'fundingDestinationOrganizations':
      case 'fundingDestinationUsageYears':
      case 'fundingDestinationLocations':
      case 'fundingDestinationEmergencies':
      case 'fundingDestinationGlobalClusters':
      case 'fundingDestinationFieldClusters':
      case 'fundingDestinationProject':
      case 'fundingDestinationPlan':
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
      case 'isRestricted': {
        const isCurrentValue = currentFlow[key];
        const isIncomingValue = incomingFlow[key];
        if (isCurrentValue !== isIncomingValue) {
          result[key] = isIncomingValue;
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
  new Set<string>(FUNDING_KEYS).has(key);

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      comparedFlow[key] = eD.data as any;
    }
  }
  return comparedFlow;
};
