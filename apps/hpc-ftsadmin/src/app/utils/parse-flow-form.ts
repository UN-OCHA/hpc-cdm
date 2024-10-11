import { FormObjectValue, flows, reportFiles } from '@unocha/hpc-data';
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
import { FlowObjectTypes, isFlowObjectTypes } from './parse-filters';
import {
  defaultOptions,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from './fn-promises';
import { ReportingDetailProps } from '../components/reporting-detail';
import dayjs from 'dayjs';

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
  id?: number
): flows.CreateFlowParams['flow']['reportDetails'] => {
  return reportDetailProps.map(
    (reportDetail) =>
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
        newlyAdded: !!id,
        reportFiles: createReportFiles(reportDetail),
      }) satisfies flows.CreateFlowParams['flow']['reportDetails'][number]
  );
};
//  TODO: Implement this function
export const parseFlowForm = (
  values: FlowFormTypeValidated,
  id?: number
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
    reportDetails: reportingDetailPropsToReportDetails(reportingDetails, id),
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
    reportFileTitle: reportDetail.reportFiles[0]?.title ?? '',
    file: fileAssetEntityToFileUploadResult(
      reportDetail.reportFiles[0]?.fileAssetEntity
    ),
    reportURLTitle: reportDetail.reportFiles[1]?.title ?? '',
    url: reportDetail.reportFiles[1]?.url ?? '',
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
  // TODO
  return flowForm;
};
