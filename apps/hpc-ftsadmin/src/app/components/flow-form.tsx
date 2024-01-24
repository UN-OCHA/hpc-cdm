import React, { useState, useEffect } from 'react';
import { Form, Formik, FieldArray } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';
import dayjs from 'dayjs';

import { C, dialogs } from '@unocha/hpc-ui';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Environment } from '../../environments/interface';
import { MdAdd, MdRemove } from 'react-icons/md';
import { usageYears } from '@unocha/hpc-data';
import { isValidDate, isValidYear } from '../utils/validation';

type AutoCompleteSeletionType =
  | {
      label: string;
      id: string;
      isAutoFilled?: boolean;
    }
  | string;

export interface ReportDetailType {
  verified: string;
  reportSource: string;
  reporterReferenceCode: string;
  reportChannel: string;
  reportedOrganization: AutoCompleteSeletionType;
  reportedDate: string;
  reporterContactInformation: string;
  sourceSystemRecordId: string;
  reportFiles: {
    title: string;
  }[];
  versionId?: number;
}

export interface FormValues {
  amountUSD: number;
  keywords: AutoCompleteSeletionType[];
  flowStatus: string;
  flowType: string;
  flowDescription: string;
  firstReported: string;
  decisionDate: string | null;
  budgetYear: string;
  flowDate: string;
  contributionType: string;
  earmarkingType: AutoCompleteSeletionType;
  method: string;
  beneficiaryGroup: string;
  inactiveReason: string;
  origCurrency: AutoCompleteSeletionType;
  amountOriginal: number;
  exchangeRateUsed: number;
  notes: string;
  sourceOrganizations: AutoCompleteSeletionType[];
  sourceCountries: AutoCompleteSeletionType[];
  sourceUsageYears: AutoCompleteSeletionType[];
  sourceProjects: AutoCompleteSeletionType[];
  sourcePlans: AutoCompleteSeletionType[];
  sourceGlobalClusters: AutoCompleteSeletionType[];
  sourceEmergencies: AutoCompleteSeletionType[];
  destinationOrganizations: AutoCompleteSeletionType[];
  destinationCountries: AutoCompleteSeletionType[];
  destinationUsageYears: AutoCompleteSeletionType[];
  destinationProjects: AutoCompleteSeletionType[];
  destinationPlans: AutoCompleteSeletionType[];
  destinationGlobalClusters: AutoCompleteSeletionType[];
  destinationEmergencies: AutoCompleteSeletionType[];
  reportDetails: ReportDetailType[];
}

export interface VersionDataType {
  versionId: number;
  flowId: number;
  createdTime: string;
  createdBy: string | null;
  updatedTime: string;
  updatedBy: string | null;
  active: boolean;
  viewing: boolean;
  source: any;
  destination: any;
  categories: any;
  uniqueSources: any;
  uniqueDestinations: any;
  uniqueCategories: any;
}

interface Props {
  environment: Environment;
  isEdit: boolean;
  initialValue: FormValues;
  prevDetails?: ReportDetailType[];
  versionData?: VersionDataType[];
}

const StyledLayoutRow = tw.div`
flex
`;
const StyledHalfSection = tw.div`
w-1/2
`;
const StyledFullSection = tw.div`
w-full
mb-6
`;
const StyledRow = tw.div`
flex
gap-4
w-full
`;
const StyledFormRow = tw.div`
flex
gap-2
w-full
items-center
`;
const StyledAnchor = tw.a`
underline
`;
const StyledAnchorDiv = tw.div`
text-right
w-full
`;
const StyledRadioDiv = tw.div`
relative
w-full
`;
const StyledFieldset = tw.fieldset`
w-full
box-border
rounded-xl
mt-[16px]
mb-[8px]
border-gray-100
`;
const StyledCurrencyRow = tw.div`
w-1/2
`;
const StyledAddReportDetailButton = tw(C.Button)`
ml-[25px]
mb-6
`;

const initialReportDetail = {
  verified: 'verified',
  reportSource: 'primary',
  reporterReferenceCode: '',
  reportChannel: '',
  reportedOrganization: '',
  reportedDate: dayjs().format('MM/DD/YYYY'),
  reporterContactInformation: '',
  sourceSystemRecordId: '',
};

export const FlowForm = (props: Props) => {
  const { environment, initialValue, isEdit, prevDetails, versionData } = props;
  const { confirm } = dialogs;

  const handleSubmit = (values: FormValues) => {
    console.log(values);
  };
  const [objects, setObjects] = useState<Record<string, any[]>>({});
  const [showingTypes, setShowingTypes] = useState<string[]>([]);
  const [comparingVersions, setComparingVersions] = useState<VersionDataType[]>(
    []
  );
  const [comparedVersions, setComparedVersions] = useState<VersionDataType[]>(
    []
  );

  const buttonText = 'Calculate The Exchange Rate';

  const handleCalculateExchangeRate = (values: any, setFieldValue: any) => {
    const { amountOriginal, amountUSD } = values;

    if (amountOriginal && amountUSD) {
      const exchangeRateUsed = amountOriginal / amountUSD;
      setFieldValue('exchangeRateUsed', exchangeRateUsed.toFixed(4));
    } else if (amountOriginal && !amountUSD) {
      const calculatedAmountUSD = amountOriginal / values.exchangeRateUsed;
      setFieldValue('amountUSD', calculatedAmountUSD.toFixed(4));
    } else if (!amountOriginal && amountUSD) {
      const calculatedAmountOriginal = amountUSD * values.exchangeRateUsed;
      setFieldValue('amountOriginal', calculatedAmountOriginal.toFixed(4));
    } else {
      console.warn('Both original amount and USD amount are missing.');
    }
  };

  const setObjectsWithArray = (
    fetchedObject: any,
    objectKeys: string[],
    settingArrayKeys: string[],
    setFieldValue: any
  ) => {
    const newObjects = { ...objects };
    const newShowingTypes = [...showingTypes];
    objectKeys.forEach((key, i) => {
      if (fetchedObject[settingArrayKeys[i]]) {
        newObjects[key] = checkIfExistingAndCopy(
          newObjects[key],
          fetchedObject,
          settingArrayKeys[i]
        );
      }

      if (
        newObjects[key] &&
        newObjects[key].length &&
        newShowingTypes.indexOf(key) === -1
      ) {
        newShowingTypes.push(key);
      }

      const parsedResponse = newObjects[key].map((responseValue: any) => {
        if (settingArrayKeys[i] === 'years') {
          return {
            label: (responseValue as usageYears.UsageYear).year,
            id: responseValue.id,
            isAutoFilled: true,
          };
        } else if (settingArrayKeys[i] === 'plans') {
          return {
            label: (responseValue.planVersion as { id: number; name: string })
              .name,
            id: responseValue.planVersion.id,
            isAutoFilled: true,
          };
        } else {
          return {
            label: (responseValue as { id: number; name: string }).name,
            id: responseValue.id,
            isAutoFilled: true,
          };
        }
      });
      setFieldValue(newShowingTypes[i], parsedResponse);
    });

    setObjects(newObjects);
    setShowingTypes(newShowingTypes);
  };

  const checkIfExistingAndCopy = (
    existingObjects: any[],
    object: any,
    key: string
  ): any[] => {
    let newObjects = object[key];
    if (key === 'locations') {
      newObjects = newObjects.filter(function (location: any) {
        return location.adminLevel === 0;
      });
      if (existingObjects && existingObjects.length) {
        existingObjects = existingObjects.filter(function (location) {
          return location.adminLevel === 0;
        });
      }
    }

    if (existingObjects && existingObjects.length) {
      const existingObjectsIds = existingObjects.map(function (o) {
        return o.id;
      });
      if (Array.isArray(newObjects)) {
        newObjects.forEach(function (obj) {
          if (existingObjectsIds.indexOf(obj.id) === -1) {
            obj.suggested = true;
            existingObjects.push(obj);
          }
        });
      } else {
        if (existingObjectsIds.indexOf(newObjects.id) === -1) {
          newObjects.suggested = true;
          existingObjects.push(newObjects);
        }
      }
    } else {
      if (newObjects) {
        if (Array.isArray(newObjects)) {
          newObjects.forEach(function (obj) {
            obj.suggested = true;
          });
          existingObjects = newObjects;
        } else {
          newObjects.suggested = true;
          existingObjects = [newObjects];
        }
      }
    }
    return existingObjects;
  };

  const fetchPlanDetails = async (
    objectType: string,
    plan: any,
    setFieldValue: any
  ) => {
    const fetchedPlan = await environment.model.plans.getPlan(plan[0].id);
    if (objectType === 'sourcePlans') {
      setObjectsWithArray(
        fetchedPlan,
        ['sourceUsageYears', 'sourceEmergencies'],
        ['years', 'emergencies'],
        setFieldValue
      );
    }
    if (objectType === 'destinationPlans') {
      setObjectsWithArray(
        fetchedPlan,
        ['destinationUsageYears', 'destinationEmergencies'],
        ['years', 'emergencies'],
        setFieldValue
      );
    }
    if (fetchedPlan.locations) {
      const countries = fetchedPlan.locations.filter(function (loc) {
        return loc.adminLevel === 0;
      });
      if (countries.length === 1) {
        if (objectType === 'sourcePlans') {
          setObjectsWithArray(
            { locations: countries },
            ['sourceCountries'],
            ['locations'],
            setFieldValue
          );
        }
        if (objectType === 'destinationPlans') {
          setObjectsWithArray(
            { locations: countries },
            ['destinationCountries'],
            ['locations'],
            setFieldValue
          );
        }
      }
    }
  };

  const fetchEmergencyDetails = async (
    objectType: string,
    emergency: any,
    setFieldValue: any
  ) => {
    if (objectType === 'destinationEmergencies') {
      const fetchedEmergency = await environment.model.emergencies.getEmergency(
        emergency[0].id
      );
      if (fetchedEmergency.locations.length <= 1) {
        setObjectsWithArray(
          fetchedEmergency,
          ['destinationCountries'],
          ['locations'],
          setFieldValue
        );
      }
    }
  };
  const fetchProjectDetails = async (
    objectType: string,
    project: any,
    setFieldValue: any
  ) => {
    if (objectType === 'destinationProjects') {
      const fetchedCategories =
        await environment.model.categories.getCategories({
          query: 'earmarkingType',
        });
      const category = fetchedCategories.filter(
        (item) => item.name === 'Earmarked'
      );
      setFieldValue('earmarkingType', {
        id: category[0],
        label: category[0].name,
      });
    } else {
      const fetchedProject = await environment.model.projects.getProject(
        project[0].id
      );
      const publishedVersion = fetchedProject.projectVersions.filter(function (
        version
      ) {
        return version.id === fetchedProject.currentPublishedVersionId;
      })[0];

      const overridingClusters = publishedVersion.governingEntities.filter(
        function (cluster) {
          return cluster.overriding;
        }
      );

      if (overridingClusters.length > 0) {
        publishedVersion.governingEntities = overridingClusters;
      }
      setObjectsWithArray(
        publishedVersion,
        [
          'sourcePlans',
          'sourceCountries',
          'sourceGoverningEntities',
          'sourceGlobalClusters',
          'sourceOrganizations',
        ],
        [
          'plans',
          'locations',
          'governingEntities',
          'globalClusters',
          'organizations',
        ],
        setFieldValue
      );
    }
  };
  const fetchOrganizationDetails = async (
    objectType: string,
    organization: any,
    setFieldValue: any
  ) => {
    const fetchedOrg = await environment.model.organizations.getOrganization(
      organization[0].id
    );
    const isGovernment = fetchedOrg[0].categories.some(function (category) {
      return (
        category.group === 'organizationType' &&
        /**
         * 114 = Governments
         * 123 = Country-based UN Pooled Funds
         */
        [114, 123].includes(category.id)
      );
    });
    if (isGovernment && objectType === 'sourceOrganizations') {
      objects.sourceCountries = checkIfExistingAndCopy(
        objects.location,
        fetchedOrg[0],
        'locations'
      );
      setObjectsWithArray(
        objects,
        ['sourceCountries'],
        ['locations'],
        setFieldValue
      );
    }
  };
  const fetchAssociatedGoverningEntity = async (
    objectType: string,
    globalCluster: any,
    setFieldValue: any
  ) => {
    const fetchedGoverningEntities =
      await environment.model.governingEntities.getAllPlanGoverningEntities(
        globalCluster[0].id
      );
    console.log(fetchedGoverningEntities);
  };

  const handleCompareCheck = (
    checkedVersion: VersionDataType,
    isChecked: boolean
  ) => {
    setComparingVersions((prev: VersionDataType[]) => {
      if (isChecked) {
        return [...prev, checkedVersion];
      } else {
        return prev.filter(
          (version: VersionDataType) =>
            version.versionId !== checkedVersion.versionId
        );
      }
    });
  };

  const objectTypes = [
    'emergencies',
    'projects',
    'usageYears',
    'globalClusters',
    'locations',
    'plans',
    'organizations',
  ];

  const extractUniqueFromArray = (array1: any, array2: any) => {
    return array1.filter((item: any) => !array2.includes(item));
  };

  const compareVersions = (versions: VersionDataType[]) => {
    const version1 = versions[0];
    const version2 = versions[1];
    const newVersion1 = {
      ...version1,
      uniqueSources: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version1.source[type],
            version2.source[type]
          );
          return acc;
        },
        {}
      ),
      uniqueDestinations: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version1.destination[type],
            version2.destination[type]
          );
          return acc;
        },
        {}
      ),
      uniqueCategories: extractUniqueFromArray(
        version1.categories,
        version2.categories
      ),
    };

    const newVersion2 = {
      ...version2,
      uniqueSources: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version2.source[type],
            version1.source[type]
          );
          return acc;
        },
        {}
      ),
      uniqueDestinations: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version2.destination[type],
            version1.destination[type]
          );
          return acc;
        },
        {}
      ),
      uniqueCategories: extractUniqueFromArray(
        version2.categories,
        version1.categories
      ),
    };
    return [newVersion1, newVersion2];
  };

  useEffect(() => {
    if (comparingVersions.length === 2) {
      const compared = compareVersions(comparingVersions);
      setComparedVersions(compared);
    }
  }, [comparingVersions]);
  const dictExecutedForEachObject: Record<
    string,
    (objectType: string, flowObject: any, setFieldValue: any) => Promise<any>
  > = {
    sourcePlans: fetchPlanDetails,
    destinationPlans: fetchPlanDetails,
    destinationEmergencies: fetchEmergencyDetails,
    sourceProjects: fetchProjectDetails,
    destinationProjects: fetchProjectDetails,
    sourceOrganizations: fetchOrganizationDetails,
    sourceGlobalClusters: fetchAssociatedGoverningEntity,
  };

  const updateFlowObjects = async (
    objectType: string,
    flowObject: any,
    setFieldValue: any
  ) => {
    if (flowObject.length > 0 && dictExecutedForEachObject[objectType]) {
      await dictExecutedForEachObject[objectType](
        objectType,
        flowObject,
        setFieldValue
      );
    }
  };

  const FORM_SETTINGS = {
    organization: {
      behavior: 'shared',
    },
    project: {
      behavior: 'overlap',
    },
    usageYear: {
      behavior: 'shared',
    },
    location: {
      behavior: 'shared',
    },
    globalCluster: {
      behavior: 'shared',
    },
    emergency: {
      behavior: 'overlap',
    },
    governingEntity: {
      behavior: 'shared',
    },
    plan: {
      behavior: 'overlap',
    },
  };

  const FORM_VALIDATION = object().shape({
    sourceOrganizations: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Organization is required and should have at least 1 item'),
    sourceUsageYears: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Usage Year is required and should have at least 1 item'),
    sourceCountries: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Country is required and should have at least 1 item'),
    sourceEmergencies: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Emergency is required and should have at least 1 item'),
    sourceGlobalClusters: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Clobal Cluster is required and should have at least 1 item'),
    sourcePlans: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Plan is required and should have at least 1 item'),
    sourceProjects: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Projects is required and should have at least 1 item'),
    destinationOrganizations: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Organization is required and should have at least 1 item'),
    destinationUsageYears: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Usage Year is required and should have at least 1 item'),
    destinationCountries: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Country is required and should have at least 1 item'),
    destinationEmergencies: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Emergency is required and should have at least 1 item'),
    destinationGlobalClusters: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Clobal Cluster is required and should have at least 1 item'),
    destinationPlans: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Plan is required and should have at least 1 item'),
    destinationProjects: array()
      .of(object().shape({ label: string(), id: string() }))
      .min(1, 'Projects is required and should have at least 1 item'),
    amountUSD: number().min(0, 'Only non-negative numbers are accepted'),
    amountOriginal: number().min(0, 'Only non-negative numbers are accepted'),
    exchangeRateUsed: number().min(0, 'Only non-negative numbers are accepted'),
    flowDescription: string().required(),
    firstReported: string()
      .nullable()
      .required()
      .test('validate-format-date', 'Date entered is invalid', (value) =>
        isValidDate(value ?? '')
      ),
    decisionDate: string()
      .nullable()
      .test('validate-format-date', 'Date entered is invalid', (value) =>
        value ? isValidDate(value) : true
      ),
    budgetYear: string().test(
      'validate-format-year',
      'Year entered is invalid',
      (value) => (value ? isValidYear(value) : true)
    ),
    flowDate: string()
      .nullable()
      .required()
      .test('validate-format-date', 'Date entered is invalid', (value) =>
        isValidDate(value ?? '')
      ),
    flowStatus: string().required(),
    method: string().required(),

    sourceSystemId: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    flowLegacyId: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    reportDetails: array()
      .of(
        object().shape({
          verified: string().required(),
          reportSource: string().required(),
          reporterReferenceCode: number()
            .positive()
            .typeError('Only positive integers are accepted'),
          reportChannel: string(),
          reportedOrganization: object()
            .shape({ label: string(), id: string() })
            .required(),
          reportedDate: string()
            .nullable()
            .required()
            .test('validate-format-date', 'Date entered is invalid', (value) =>
              isValidDate(value ?? '')
            ),
          reporterContactInformation: string(),
          sourceSystemRecordId: string(),
        })
      )
      .min(
        1,
        'Report detail information is required and should have at least 1'
      ),
  });

  return (
    <Formik
      initialValues={initialValue}
      validationSchema={FORM_VALIDATION}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => {
        return (
          <Form>
            <StyledLayoutRow>
              <StyledHalfSection>
                <StyledFullSection>
                  <C.FormSection title="Funding Source(s)" isLeftSection>
                    <C.AsyncAutocompleteSelect
                      label="Organization(s)"
                      name="sourceOrganizations"
                      fnPromise={
                        environment.model.organizations
                          .getAutocompleteOrganizations
                      }
                      behavior={FORM_SETTINGS.organization.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      isMulti
                    />
                    <StyledRow>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelect
                          label="Usage Year(s)"
                          name="sourceUsageYears"
                          fnPromise={environment.model.usageYears.getUsageYears}
                          isMulti
                          behavior={FORM_SETTINGS.usageYear.behavior}
                          isAutocompleteAPI={false}
                        />
                      </StyledHalfSection>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelect
                          label="Country(ies) (Admin level 0)"
                          name="sourceCountries"
                          fnPromise={
                            environment.model.locations.getAutocompleteLocations
                          }
                          behavior={FORM_SETTINGS.location.behavior}
                          isMulti
                        />
                      </StyledHalfSection>
                    </StyledRow>
                    <C.AsyncAutocompleteSelect
                      label="Emergency(ies)"
                      name="sourceEmergencies"
                      fnPromise={
                        environment.model.emergencies.getAutocompleteEmergencies
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      behavior={FORM_SETTINGS.emergency.behavior}
                      isMulti
                    />
                    <C.AsyncAutocompleteSelect
                      label="Global Cluster(s)"
                      name="sourceGlobalClusters"
                      fnPromise={
                        environment.model.globalClusters.getGlobalClusters
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      behavior={FORM_SETTINGS.globalCluster.behavior}
                      isMulti
                      isAutocompleteAPI={false}
                    />
                    <C.AsyncAutocompleteSelect
                      label="Plan"
                      name="sourcePlans"
                      fnPromise={environment.model.plans.getAutocompletePlans}
                      isMulti
                      behavior={FORM_SETTINGS.plan.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                    />
                    <C.AsyncAutocompleteSelect
                      label="Project"
                      name="sourceProjects"
                      fnPromise={
                        environment.model.projects.getAutocompleteProjects
                      }
                      behavior={FORM_SETTINGS.project.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      isMulti
                    />
                  </C.FormSection>
                </StyledFullSection>
              </StyledHalfSection>
              <StyledHalfSection>
                <StyledFullSection>
                  <C.FormSection title="Funding Destination(s)" isRightSection>
                    <C.AsyncAutocompleteSelect
                      label="Organization(s)"
                      name="destinationOrganizations"
                      fnPromise={
                        environment.model.organizations
                          .getAutocompleteOrganizations
                      }
                      behavior={FORM_SETTINGS.organization.behavior}
                      isMulti
                    />
                    <StyledRow>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelect
                          label="Usage Year(s)"
                          name="destinationUsageYears"
                          fnPromise={environment.model.usageYears.getUsageYears}
                          isMulti
                          behavior={FORM_SETTINGS.usageYear.behavior}
                          isAutocompleteAPI={false}
                        />
                      </StyledHalfSection>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelect
                          label="Country(ies) (Admin level 0)"
                          name="destinationCountries"
                          fnPromise={
                            environment.model.locations.getAutocompleteLocations
                          }
                          behavior={FORM_SETTINGS.location.behavior}
                          isMulti
                        />
                      </StyledHalfSection>
                    </StyledRow>
                    <C.AsyncAutocompleteSelect
                      label="Global Cluster(s)"
                      name="destinationGlobalClusters"
                      fnPromise={
                        environment.model.globalClusters.getGlobalClusters
                      }
                      behavior={FORM_SETTINGS.globalCluster.behavior}
                      isMulti
                    />
                    <C.AsyncAutocompleteSelect
                      label="Plan"
                      name="destinationPlans"
                      fnPromise={environment.model.plans.getAutocompletePlans}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      behavior={FORM_SETTINGS.plan.behavior}
                      isMulti
                    />
                    <C.AsyncAutocompleteSelect
                      label="Emergency(ies)"
                      name="destinationEmergencies"
                      fnPromise={
                        environment.model.emergencies.getAutocompleteEmergencies
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      isMulti
                    />
                    <C.AsyncAutocompleteSelect
                      label="Project"
                      name="destinationProjects"
                      fnPromise={
                        environment.model.projects.getAutocompleteProjects
                      }
                      behavior={FORM_SETTINGS.project.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      isMulti
                    />
                  </C.FormSection>
                </StyledFullSection>
              </StyledHalfSection>
            </StyledLayoutRow>
            <StyledFullSection>
              <C.FormSection title="Flow">
                <StyledRow>
                  <StyledHalfSection>
                    <C.CheckBox
                      label="Is this flow new money?"
                      name="includeChildrenOfParkedFlows"
                      size="small"
                    />
                    <StyledFormRow>
                      <C.TextFieldWrapper
                        label="Funding Amount in USD"
                        name="amountUSD"
                        type="currency"
                        thousandSeparator
                      />
                    </StyledFormRow>
                    <C.Section title="Original Currency" type="secondary">
                      <StyledRow>
                        <C.TextFieldWrapper
                          label="Funding Amount (original currency)"
                          name="amountOriginal"
                          type="number"
                          thousandSeparator
                        />
                        <StyledCurrencyRow>
                          <C.AsyncAutocompleteSelect
                            label="Currency"
                            name="origCurrency"
                            fnPromise={
                              environment.model.currencies.getCurrencies
                            }
                            isAutocompleteAPI={false}
                          />
                        </StyledCurrencyRow>
                      </StyledRow>
                      <C.TextFieldWrapper
                        label="Exchange Rate Used"
                        name="exchangeRateUsed"
                        type="number"
                        thousandSeparator
                      />
                      <StyledAnchorDiv>
                        <StyledAnchor
                          href="https://treasury.un.org/operationalrates/OperationalRates.php"
                          target="_blank"
                        >
                          UN Treasury rates
                        </StyledAnchor>
                      </StyledAnchorDiv>
                      <C.Button
                        onClick={() => {
                          handleCalculateExchangeRate(values, setFieldValue);
                        }}
                        color="primary"
                        text={buttonText}
                      ></C.Button>
                    </C.Section>
                    <C.TextFieldWrapper
                      label="Funding Flow Description"
                      placeholder="1-2 sentences for flow name"
                      name="flowDescription"
                      multiline
                      rows={2}
                      type="text"
                    />
                    <StyledFormRow>
                      <C.DatePicker
                        name="firstReported"
                        label="First Reported"
                      />
                      <C.DatePicker
                        name="decisionDate"
                        label="Decision Dateⓢ"
                      />
                    </StyledFormRow>
                    <StyledHalfSection>
                      <C.TextFieldWrapper
                        label="Donor Budget Year"
                        name="budgetYear"
                        type="text"
                      />
                    </StyledHalfSection>
                  </StyledHalfSection>
                  <StyledHalfSection>
                    <C.AsyncSingleSelect
                      label="Flow Type"
                      name="flowType"
                      fnPromise={environment.model.categories.getCategories}
                      category="flowType"
                      hasNameValue
                    />
                    <C.AsyncSingleSelect
                      label="Flow Status"
                      name="flowStatus"
                      fnPromise={environment.model.categories.getCategories}
                      category="flowStatus"
                      hasNameValue
                    />
                    <C.DatePicker name="flowDate" label="Flow Date" />
                    <C.AsyncSingleSelect
                      label="Contribution Type"
                      name="contributionType"
                      fnPromise={environment.model.categories.getCategories}
                      category="contributionType"
                      hasNameValue
                    />
                    <C.AsyncAutocompleteSelect
                      label="Gb Earmarking"
                      name="earmarkingType"
                      fnPromise={environment.model.categories.getCategories}
                      category="earmarkingType"
                      isAutocompleteAPI={false}
                    />
                    <C.AsyncSingleSelect
                      label="Aid Modality"
                      name="method"
                      fnPromise={environment.model.categories.getCategories}
                      category="method"
                      hasNameValue
                    />
                    <C.AsyncAutocompleteSelect
                      label="Keywords"
                      name="keywords"
                      fnPromise={environment.model.categories.getCategories}
                      category="keywords"
                      isMulti
                      isAutocompleteAPI={false}
                    />
                    <C.AsyncSingleSelect
                      label="Beneficiary Group"
                      name="beneficiaryGroup"
                      fnPromise={environment.model.categories.getCategories}
                      category="beneficiaryGroup"
                      hasNameValue
                    />
                  </StyledHalfSection>
                </StyledRow>
                <StyledRow>
                  <C.TextFieldWrapper
                    label="Notes"
                    name="notes"
                    multiline
                    rows={4}
                    type="text"
                  />
                </StyledRow>
              </C.FormSection>
            </StyledFullSection>
            <StyledFullSection>
              <C.FormSection title="Linked Flows">
                <StyledRow>
                  <C.Button
                    onClick={() => {
                      return true;
                      confirm({
                        title: 'Confirm Action',
                        message: 'Are you sure you want to proceed?',
                        buttonConfirm: 'Yes',
                        buttonCancel: 'No',
                      }).then((result: any) => {
                        if (result) {
                          console.log('Yes');
                          // User clicked 'Yes'
                        } else {
                          console.log('No');
                          // User clicked 'No'
                        }
                      });
                    }}
                    color="primary"
                    text="Add Parent Flow"
                    startIcon={MdAdd}
                  />
                  <C.Button
                    onClick={() => {
                      return true;
                    }}
                    color="primary"
                    text="Add Child Flow"
                    startIcon={MdAdd}
                  />
                </StyledRow>
              </C.FormSection>
            </StyledFullSection>
            <FieldArray name="reportDetails">
              {({ remove, push }) => (
                <>
                  {values.reportDetails.length > 0 &&
                    values.reportDetails.map((_, index) => (
                      <StyledFullSection key={index}>
                        <C.FormSection title="Reporting Details">
                          <StyledRow>
                            <StyledHalfSection>
                              <C.RadioGroup
                                name={`reportDetails[${index}].reportSource`}
                                options={[
                                  { value: 'primary', label: 'Primary' },
                                  { value: 'secondary', label: 'Secondary' },
                                ]}
                                label="Report Source"
                                row
                              />
                              <C.AsyncAutocompleteSelect
                                label="Reported By Organization"
                                name={`reportDetails[${index}].reportedOrganization`}
                                placeholder="Reported by Organization"
                                fnPromise={
                                  environment.model.organizations
                                    .getAutocompleteOrganizations
                                }
                              />
                              <C.AsyncSingleSelect
                                label="Reported Channel"
                                name={`reportDetails[${index}].reportChannel`}
                                fnPromise={
                                  environment.model.categories.getCategories
                                }
                                category="reportChannel"
                                hasNameValue
                              />
                              <C.TextFieldWrapper
                                label="Source System Record Id"
                                name={`reportDetails[${index}].sourceSystemRecordId`}
                                type="text"
                              />
                              <StyledFieldset>
                                <C.TextFieldWrapper
                                  label="Title"
                                  name={`reportDetails[${index}].reportFileTitle`}
                                  type="text"
                                />
                                <C.FileUpload />
                                <C.TextFieldWrapper
                                  label="Title"
                                  name={`reportDetails[${index}].reportUrlTitle`}
                                  type="text"
                                />
                                <C.TextFieldWrapper
                                  label="URL"
                                  name={`reportDetails[${index}].reportUrl`}
                                  type="text"
                                />
                              </StyledFieldset>
                              {values.reportDetails.length > 1 && (
                                <C.Button
                                  onClick={() => {
                                    remove(index);
                                  }}
                                  color="secondary"
                                  text="Remove Reporting Detail"
                                  startIcon={MdRemove}
                                />
                              )}
                            </StyledHalfSection>
                            <StyledHalfSection>
                              <StyledRadioDiv>
                                <C.RadioGroup
                                  name={`reportDetails[${index}].verified`}
                                  options={[
                                    { value: 'verified', label: 'Verified' },
                                    {
                                      value: 'unverified',
                                      label: 'Unverified',
                                    },
                                  ]}
                                  label="Verified"
                                  row
                                />
                              </StyledRadioDiv>
                              <C.DatePicker
                                name={`reportDetails[${index}].reportedDate`}
                                label="Date Reported"
                              />
                              <C.TextFieldWrapper
                                label="Reporter Reference Code"
                                name={`reportDetails[${index}].reporterReferenceCode`}
                                type="text"
                              />
                              <C.TextFieldWrapper
                                label="Reporter Contact Information"
                                name={`reportDetails[${index}].reporterContactInformation`}
                                multiline
                                rows={4}
                                type="text"
                              />
                            </StyledHalfSection>
                          </StyledRow>
                        </C.FormSection>
                      </StyledFullSection>
                    ))}
                  <StyledAddReportDetailButton
                    onClick={() => {
                      push(initialReportDetail);
                    }}
                    color="primary"
                    text="Add Reporting Detail"
                    startIcon={MdAdd}
                  />
                </>
              )}
            </FieldArray>
            {isEdit && prevDetails && prevDetails.length > 0 && (
              <StyledFullSection>
                <C.FormSection title="Previous Reporting Details">
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Version</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Organization</TableCell>
                          <TableCell>Date Reported</TableCell>
                          <TableCell>Channel</TableCell>
                          <TableCell>Record ID</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell>Ref Code</TableCell>
                          <TableCell>Verified?</TableCell>
                          <TableCell>Docs</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prevDetails.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.versionId}
                            </TableCell>
                            <TableCell>{row.reportSource}</TableCell>
                            <TableCell>
                              {typeof row.reportedOrganization === 'string'
                                ? row.reportedOrganization
                                : row.reportedOrganization.label}
                            </TableCell>
                            <TableCell>{row.reportedDate}</TableCell>
                            <TableCell>{row.reportChannel}</TableCell>
                            <TableCell>{row.sourceSystemRecordId}</TableCell>
                            <TableCell>
                              {row.reporterContactInformation}
                            </TableCell>
                            <TableCell>{row.reporterReferenceCode}</TableCell>
                            <TableCell>
                              {row.verified === 'verified' ? 'Yes' : 'No'}
                            </TableCell>
                            <TableCell>
                              {row.reportFiles
                                .map((file) => file.title)
                                .join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </C.FormSection>
              </StyledFullSection>
            )}
            {isEdit && versionData && versionData.length > 0 && (
              <StyledFullSection>
                <C.FormSection title="Flow Versions">
                  {versionData.map((version) => (
                    <C.CheckBox
                      key={`${version.flowId}-${version.versionId}`}
                      name={`${version.flowId}-${version.versionId}`}
                      value={version}
                      label={
                        `${version.flowId}-${version.versionId}` +
                        `${version.active ? ' [Active] ' : ' '}` +
                        `${version.viewing ? '[Viewing]' : ''} ` +
                        `Created at ${version.createdTime} by ${
                          version.createdBy ?? 'FTS User'
                        }, ` +
                        `updated at ${version.updatedTime} by ${
                          version.updatedBy ?? 'FTS User'
                        }`
                      }
                      // checked={comparingVersions.some(
                      //   (v) => v.versionId === version.versionId
                      // )}
                      onChange={(e) => {
                        handleCompareCheck(version, e.target.checked);
                      }}
                      // disabled={
                      //   comparingVersions.length === 2 &&
                      //   !comparingVersions.some(
                      //     (v) => v.versionId === version.versionId
                      //   )
                      // }
                    />
                  ))}
                  {comparingVersions.length === 2 && (
                    <div>
                      Comparing versions{' '}
                      {comparedVersions.map((version, index) => (
                        <span key={version.versionId}>
                          {version.versionId}
                          {index < comparedVersions.length - 1 ? ',' : ''}
                        </span>
                      ))}{' '}
                      differences:
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              {comparedVersions.map((version) => (
                                <TableCell
                                  key={version.versionId}
                                >{`${version.flowId} ${version.versionId}`}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Sources</TableCell>
                              {comparedVersions.map((version) => (
                                <TableCell key={version.versionId}>
                                  {objectTypes.map(
                                    (type) =>
                                      version.uniqueSources[type] &&
                                      version.uniqueSources[type].length >
                                        0 && (
                                        <div key={type}>
                                          {type}:{' '}
                                          {version.uniqueSources[type].join(
                                            ', '
                                          )}
                                        </div>
                                      )
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              <TableCell>Destinations</TableCell>
                              {comparedVersions.map((version) => (
                                <TableCell key={version.versionId}>
                                  {objectTypes.map(
                                    (type) =>
                                      version.uniqueDestinations[type] &&
                                      version.uniqueDestinations[type].length >
                                        0 && (
                                        <div key={type}>
                                          {type}:{' '}
                                          {version.uniqueDestinations[
                                            type
                                          ].join(', ')}
                                        </div>
                                      )
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                            {(comparedVersions[0] &&
                              comparedVersions[0].uniqueCategories.length) >
                              0 ||
                            (comparedVersions[1] &&
                              comparedVersions[1].uniqueCategories.length >
                                0) ? (
                              <TableRow>
                                <TableCell>Categories</TableCell>
                                <TableCell>
                                  {comparedVersions[0].uniqueCategories.join(
                                    ', '
                                  )}
                                </TableCell>
                                <TableCell>
                                  {comparedVersions[1].uniqueCategories.join(
                                    ', '
                                  )}
                                </TableCell>
                              </TableRow>
                            ) : null}
                            {/* {flowValuesForDisplay.map(
                            (value) =>
                              comparingVersions[0][value] !==
                                comparingVersions[1][value] && (
                                <tr key={value}>
                                  <td>{value}</td>
                                  {comparingVersions.map((version) => (
                                    <td key={version.versionID}>
                                      {value.includes('Date')
                                        ? new Date(
                                            version[value]
                                          ).toLocaleDateString('en-CA') // yyyy-MM-dd format
                                        : version[value]}
                                    </td>
                                  ))}
                                </tr>
                              )
                          )} */}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  )}
                </C.FormSection>
              </StyledFullSection>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};
export default FlowForm;
