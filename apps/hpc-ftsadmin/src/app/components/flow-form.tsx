import { Form, Formik, useFormikContext } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';
import React, { useState, useCallback, useRef } from 'react';

import { C, dialogs } from '@unocha/hpc-ui';
import { Environment } from '../../environments/interface';
import { MdClose, MdAdd } from 'react-icons/md';
import Fade from '@mui/material/Fade';
import { usageYears } from '@unocha/hpc-data';

interface Props {
  environment: Environment;
  selectedStep: string;
  isEdit: boolean;
}
export interface FormValues {
  amountUSD: number;
  keywords: { label: string; id: string }[];
  flowStatus: string;
  flowType: string;
  flowDescription: string;
  firstReported: string;
  decisionDate: string;
  donorBudgetYear: string;
  flowDate: string;
  contributionType: string;
  earmarkingType: string;
  method: string;
  beneficiaryGroup: string;
  reportSource: string;
  reportChannel: string;
  verified: string;
  origCurrency: string;
  amountOriginal: number;
  exchangeRateUsed: number;
  sourceOrganizations: { label: string; id: string }[];
  sourceCountries: { label: string; id: string }[];
  sourceUsageYears: { label: string; id: string }[];
  sourceProjects: { label: string; id: string }[];
  sourcePlans: { label: string; id: string }[];
  sourceGlobalClusters: { label: string; id: string }[];
  sourceEmergencies: { label: string; id: string }[];
  destinationOrganizations: { label: string; id: string }[];
  destinationCountries: { label: string; id: string }[];
  destinationUsageYears: { label: string; id: string }[];
  destinationProjects: { label: string; id: string }[];
  destinationPlans: { label: string; id: string }[];
  destinationGlobalClusters: { label: string; id: string }[];
  destinationEmergencies: { label: string; id: string }[];
}

const StyledDiv = tw.div`
my-6
me-4
lg:flex
justify-end
gap-x-4 
`;

const StyledHalfSection = tw.div`
w-1/2
`;
const StyledFullSection = tw.div`
w-full
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
w-1/2`;
export const FlowForm = (props: Props) => {
  const { environment, selectedStep, isEdit } = props;
  const { confirm } = dialogs;

  const handleSubmit = (values: FormValues) => {
    console.log(values);
  };
  const [objects, setObjects] = useState<Record<string, any[]>>({});
  const [showingTypes, setShowingTypes] = useState<string[]>([]);
  // let buttonText = 'Calculate the Exchange Rate';

  const formikRef = useRef(null);

  // const handleButtonLabel = (values: any) => {
  //   const { amountOriginal, amountUSD } = values;

  //   if (amountOriginal && amountUSD) {
  //     buttonText = 'Calculate the Exchange Rate';
  //   } else if (amountOriginal && !amountUSD) {
  //     buttonText = 'Calculate the funding amount in USD';
  //   } else if (!amountOriginal && amountUSD) {
  //     buttonText = 'Calculate funding amount in its original currency';
  //   } else {
  //     console.warn('Both original amount and USD amount are missing.');
  //   }
  // };
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
          };
        } else if (settingArrayKeys[i] === 'plans') {
          return {
            label: (responseValue.planVersion as { id: number; name: string })
              .name,
            id: responseValue.planVersion.id,
          };
        } else {
          return {
            label: (responseValue as { id: number; name: string }).name,
            id: responseValue.id,
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
    flowId: number()
      .positive()
      .integer()
      .typeError('Only positive integers are accepted'),
    amountUSD: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    keywords: array().of(object().shape({ label: string(), id: string() })),
    flowStatus: string(),
    reporterReferenceCode: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    sourceSystemId: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    flowLegacyId: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    sourceOrganizations: array().of(
      object().shape({ label: string(), id: string() })
    ),
    sourceCountries: array().of(
      object().shape({ label: string(), id: string() })
    ),
    sourceUsageYears: array().of(
      object().shape({ label: string(), id: string() })
    ),
    destinationOrganizations: array().of(
      object().shape({ label: string(), id: string() })
    ),
    destinationCountries: array().of(
      object().shape({ label: string(), id: string() })
    ),
    destinationUsageYears: array().of(
      object().shape({ label: string(), id: string() })
    ),
  });

  return (
    <Formik
      initialValues={{
        amountUSD: 0,
        amountOriginal: 0,
        exchangeRateUsed: 0,
        keywords: [],
        flowStatus: '',
        flowType: '',
        flowDescription: '',
        firstReported: '',
        decisionDate: '',
        donorBudgetYear: '',
        flowDate: '',
        contributionType: '',
        earmarkingType: '',
        method: '',
        beneficiaryGroup: '',
        sourceOrganizations: [],
        sourceCountries: [],
        sourceUsageYears: [],
        sourceProjects: [],
        sourcePlans: [],
        sourceGlobalClusters: [],
        sourceEmergencies: [],
        destinationOrganizations: [],
        destinationCountries: [],
        destinationUsageYears: [],
        destinationProjects: [],
        destinationPlans: [],
        destinationGlobalClusters: [],
        destinationEmergencies: [],
        reportSource: 'primary',
        reportChannel: '',
        verified: 'verified',
        origCurrency: '',
      }}
      innerRef={formikRef}
      validationSchema={FORM_VALIDATION}
      onSubmit={handleSubmit}
    >
      {({ resetForm, values, setFieldValue }) => (
        <Form>
          <Fade in={selectedStep === 'fundingSources'}>
            <StyledFullSection>
              {selectedStep === 'fundingSources' && (
                <C.FormSection title="Funding Source(s)">
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
              )}
            </StyledFullSection>
          </Fade>
          <Fade in={selectedStep === 'fundingDestinations'}>
            <StyledFullSection>
              {selectedStep === 'fundingDestinations' && (
                <C.FormSection title="Funding Destination(s)">
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
              )}
            </StyledFullSection>
          </Fade>
          <Fade in={selectedStep === 'flows'}>
            <StyledFullSection>
              {selectedStep === 'flows' && (
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
                          // onChange={() => {
                          //   handleButtonLabel(values);
                          // }}
                        />
                      </StyledFormRow>
                      <C.Section title="Original Currency" type="secondary">
                        <StyledRow>
                          <C.TextFieldWrapper
                            label="Funding Amount (original currency)"
                            name="amountOriginal"
                            type="number"
                            // onChange={() => {
                            //   handleButtonLabel(values);
                            // }}
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
                          // onChange={() => {
                          //   handleButtonLabel(values);
                          // }}
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
                          enableButton={isEdit}
                        />
                        <C.DatePicker
                          name="decisionDate"
                          label="Decision Dateⓢ"
                          enableButton={isEdit}
                        />
                      </StyledFormRow>
                      <StyledHalfSection>
                        <C.TextFieldWrapper
                          label="Donor Budget Year"
                          name="budgetYear"
                          type="number"
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
                      <C.DatePicker
                        name="flowDate"
                        label="Flow Date"
                        enableButton={isEdit}
                      />
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
              )}
            </StyledFullSection>
          </Fade>
          <Fade in={selectedStep === 'linkedFlows'}>
            <StyledFullSection>
              {selectedStep === 'linkedFlows' && (
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
              )}
            </StyledFullSection>
          </Fade>
          <Fade in={selectedStep === 'reportingDetails'}>
            <StyledFullSection>
              {selectedStep === 'reportingDetails' && (
                <C.FormSection title="Reporting Details">
                  <StyledRow>
                    <StyledHalfSection>
                      <C.RadioGroup
                        name="reportSource"
                        options={[
                          { value: 'primary', label: 'Primary' },
                          { value: 'secondary', label: 'Secondary' },
                        ]}
                        label="Report Source"
                        row
                      />
                      <C.AsyncAutocompleteSelect
                        label="Reported By Organization"
                        name="reportedOrganization"
                        placeholder="Reported by Organization"
                        fnPromise={
                          environment.model.organizations
                            .getAutocompleteOrganizations
                        }
                      />
                      <C.AsyncSingleSelect
                        label="Reported Channel"
                        name="reportChannel"
                        fnPromise={environment.model.categories.getCategories}
                        category="reportChannel"
                        hasNameValue
                      />
                      <C.TextFieldWrapper
                        label="Source System Record Id"
                        name="sourceSystemRecordId"
                        type="text"
                      />
                      <StyledFieldset>
                        <C.TextFieldWrapper
                          label="Title"
                          name="reportFileTitle"
                          type="text"
                        />
                        <C.FileUpload />
                        <C.TextFieldWrapper
                          label="Title"
                          name="reportUrlTitle"
                          type="text"
                        />
                        <C.TextFieldWrapper
                          label="URL"
                          name="reportUrl"
                          type="text"
                        />
                      </StyledFieldset>
                    </StyledHalfSection>
                    <StyledHalfSection>
                      <StyledRadioDiv>
                        <C.RadioGroup
                          name="verified"
                          options={[
                            { value: 'verified', label: 'Verified' },
                            { value: 'unverified', label: 'Unverified' },
                          ]}
                          label="Verified"
                          row
                        />
                      </StyledRadioDiv>
                      <C.DatePicker
                        name="reportedDate"
                        label="Date Reported"
                        enableButton={isEdit}
                      />
                      <C.TextFieldWrapper
                        label="Reporter Reference Code"
                        name="reporterReferenceCode"
                        type="text"
                      />
                      <C.TextFieldWrapper
                        label="Reporter Contact Information"
                        name="reporterContactInformation"
                        multiline
                        rows={4}
                        type="text"
                      />
                    </StyledHalfSection>
                  </StyledRow>
                </C.FormSection>
              )}
            </StyledFullSection>
          </Fade>
        </Form>
      )}
    </Formik>
  );
};
export default FlowForm;
