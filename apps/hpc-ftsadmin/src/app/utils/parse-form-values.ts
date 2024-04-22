import {
  forms,
  flows,
  locations,
  plans,
  organizations,
  emergencies,
  projects,
  usageYears,
  globalClusters,
} from '@unocha/hpc-data';
import FlowForm, {
  FormValues,
  AutoCompleteSelectionType,
  ReportDetailType,
  VersionDataType,
  InputEntriesType,
} from '../components/flow-form';

type FundingResponseType = (
  | locations.LocationREST
  | plans.GetPlanResult
  | organizations.Organization
  | emergencies.Emergency
  | projects.GetProjectResult
  | usageYears.UsageYear
  | globalClusters.GlobalCluster
)[];

export type FundingSrcType = 'source' | 'destination';
export type FundingObjectType =
  | 'organization'
  | 'location'
  | 'usageYear'
  | 'globalCluster'
  | 'emergency'
  | 'project'
  | 'governingEntity'
  | 'plan';

enum FundingDataKey {
  organization = 'organizations',
  location = 'locations',
  usageYear = 'usageYears',
  globalCluster = 'globalClusters',
  emergency = 'emergencyies',
  project = 'projects',
  plan = 'plans',
  governingEntity = 'governingEntities',
}

const defaultSelectValue = {
  value: '0',
  displayLabel: '',
};

export const getSearchKeyValues = (
  formData: FormValues,
  key: keyof FormValues
) => {
  return (formData[key] as AutoCompleteSelectionType[]).map((option) => {
    if (typeof option !== 'string') {
      return {
        value: option.value,
        displayLabel: option.displayLabel,
      };
    }
    return defaultSelectValue;
  });
};

export const getFormValueFromCategory = (
  data: flows.FlowREST,
  groupKey: string,
  isMulti: boolean
) => {
  const formValue = data.categories
    .filter((category) => category.group === groupKey)
    .map((category) => ({
      value: category.id,
      displayLabel: category.name,
    }));

  if (isMulti) {
    return formValue;
  }
  return formValue[0] ?? '';
};

export const getFormValueFromFunding = (
  data: flows.FlowREST,
  src: FundingSrcType,
  objType: FundingObjectType,
  checkExternalRef: (
    src: FundingSrcType,
    objType: FundingObjectType,
    id: number | string,
    refType: string
  ) => boolean
) => {
  const key = FundingDataKey[objType] as keyof flows.FlowREST;

  return ((data[key] ?? []) as FundingResponseType)
    .filter((option) => option?.flowObject?.refDirection === src)
    .map((option) => {
      let displayLabel = '';
      if (objType === 'organization') {
        const optionData = option as organizations.Organization;
        displayLabel = `${optionData.name} [${optionData.abbreviation}]`;
      } else if (objType === 'usageYear') {
        const optionData = option as usageYears.UsageYear;
        displayLabel = optionData.year;
      } else if (objType === 'project') {
        const optionData = option as projects.GetProjectResult;
        const latestProject = optionData.projectVersions.filter(
          (projectVersion) => projectVersion.id === optionData.latestVersionId
        )[0];
        displayLabel = `${latestProject.name} [${latestProject.code}]`;
      } else if (objType === 'plan') {
        const optionData = option as plans.GetPlanResult;
        displayLabel = optionData.planVersion.name;
      } else {
        const optionData = option as
          | locations.LocationREST
          | emergencies.Emergency
          | globalClusters.GlobalCluster;
        displayLabel = optionData.name;
      }
      return {
        value: option.id,
        displayLabel,
        isInferred: checkExternalRef(src, objType, option.id, 'inferred'),
        isTransferred: checkExternalRef(src, objType, option.id, 'transferred'),
      };
    });
};

export const getNameOfFundingValue = (
  data: flows.FlowREST,
  src: FundingSrcType,
  objType: FundingObjectType
) => {
  const key = FundingDataKey[objType] as keyof flows.FlowREST;

  return ((data[key] ?? []) as FundingResponseType)
    .filter((option) => option?.flowObject?.refDirection === src)
    .map((option) => {
      let displayLabel = '';
      if (objType === 'organization') {
        const optionData = option as organizations.Organization;
        displayLabel = `${optionData.name} [${optionData.abbreviation}]`;
      } else if (objType === 'usageYear') {
        const optionData = option as usageYears.UsageYear;
        displayLabel = optionData.year;
      } else if (objType === 'project') {
        const optionData = option as projects.GetProjectResult;
        const latestProject = optionData.projectVersions.filter(
          (projectVersion) => projectVersion.id === optionData.latestVersionId
        )[0];
        displayLabel = `${latestProject.name} [${latestProject.code}]`;
      } else if (objType === 'plan') {
        const optionData = option as plans.GetPlanResult;
        displayLabel = optionData.planVersion.name;
      } else {
        const optionData = option as
          | locations.LocationREST
          | emergencies.Emergency
          | globalClusters.GlobalCluster;
        displayLabel = optionData.name;
      }
      return displayLabel;
    });
};

export type IndividualFormValueType =
  | number
  | string
  | AutoCompleteSelectionType
  | AutoCompleteSelectionType[]
  | null;

export const compareSelectValues = (
  active: IndividualFormValueType,
  pending: IndividualFormValueType
) => {
  if (Array.isArray(active) && Array.isArray(pending)) {
    active.sort(
      (value1, value2) =>
        parseInt(String(value1.value)) - parseInt(String(value2.value))
    );
    pending.sort(
      (value1, value2) =>
        parseInt(String(value1.value)) - parseInt(String(value2.value))
    );
  }
  return !(JSON.stringify(active) === JSON.stringify(pending));
};

const inputEntryArrayKeys = [
  'sourceOrganizations',
  'sourceLocations',
  'sourceUsageYears',
  'sourceProjects',
  'sourcePlans',
  'sourceGlobalClusters',
  'sourceEmergencies',
  'destinationOrganizations',
  'destinationLocations',
  'destinationUsageYears',
  'destinationProjects',
  'destinationPlans',
  'destinationGlobalClusters',
  'destinationEmergencies',
];

export const isArrayFieldOfInputEntries = (key: keyof InputEntriesType) => {
  return inputEntryArrayKeys.includes(key);
};

export const enumInputEntryVsSrcObjType = {
  source: {
    organization: 'sourceOrganizations',
    location: 'sourceLocations',
    usageYear: 'sourceUsageYears',
    globalCluster: 'sourceGlobalClusters',
    emergency: 'sourceEmergencies',
    project: 'sourceProjects',
    plan: 'sourcePlans',
  },
  destination: {
    organization: 'destinationOrganizations',
    location: 'destinationLocations',
    usageYear: 'destinationUsageYears',
    globalCluster: 'destinationGlobalClusters',
    emergency: 'destinationEmergencies',
    project: 'destinationProjects',
    plan: 'destinationPlans',
  },
};
