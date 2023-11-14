import { Form, Formik } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';
import React, { useState } from 'react';

import { C, dialogs } from '@unocha/hpc-ui';
import { Environment } from '../../environments/interface';
import { MdClose, MdAdd } from 'react-icons/md';
import Fade from '@mui/material/Fade';
interface Props {
  environment: Environment;
  selectedStep: string;
}
export interface FormValues {
  amountUSD: string;
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
mt-[16px]
mb-[8px]
`;
export const FlowForm = (props: Props) => {
  const { environment, selectedStep } = props;
  const { confirm } = dialogs;
  const [showComponents, setShowComponents] = useState({
    sourceEmergencies: false,
    sourcePlans: false,
    sourceGlobalClusters: false,
    sourceProjects: false,
    destinationEmergencies: false,
    destinationProjects: false,
  });

  const handleSubmit = (values: FormValues) => {
    console.log(values);
  };

  const toggleSection = (section: string, flag: boolean) => {
    setShowComponents((prevState) => ({
      ...prevState,
      [section]: flag,
    }));
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
        amountUSD: '',
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
      }}
      validationSchema={FORM_VALIDATION}
      onSubmit={handleSubmit}
    >
      {({ resetForm }) => (
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
                    isMulti
                  />
                  <StyledRow>
                    <StyledHalfSection>
                      <C.AsyncAutocompleteSelect
                        label="Usage Year(s)"
                        name="sourceUsageYears"
                        fnPromise={environment.model.usageYears.getUsageYears}
                        isMulti
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
                    isMulti
                  />
                  <C.AsyncAutocompleteSelect
                    label="Global Cluster(s)"
                    name="sourceGlobalClusters"
                    fnPromise={
                      environment.model.globalClusters.getGlobalClusters
                    }
                    isMulti
                    isAutocompleteAPI={false}
                  />
                  <C.AsyncAutocompleteSelect
                    label="Plan"
                    name="sourcePlans"
                    fnPromise={environment.model.plans.getAutocompletePlans}
                    isMulti
                  />
                  <C.AsyncAutocompleteSelect
                    label="Project"
                    name="sourceProjects"
                    fnPromise={
                      environment.model.projects.getAutocompleteProjectsGraphQL
                    }
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
                    isMulti
                  />
                  <StyledRow>
                    <StyledHalfSection>
                      <C.AsyncAutocompleteSelect
                        label="Usage Year(s)"
                        name="destinationUsageYears"
                        fnPromise={environment.model.usageYears.getUsageYears}
                        isMulti
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
                    isMulti
                  />
                  <C.AsyncAutocompleteSelect
                    label="Plan"
                    name="destinationPlans"
                    fnPromise={environment.model.plans.getAutocompletePlans}
                    isMulti
                  />
                  <C.AsyncAutocompleteSelect
                    label="Emergency(ies)"
                    name="destinationEmergencies"
                    fnPromise={
                      environment.model.emergencies.getAutocompleteEmergencies
                    }
                    isMulti
                  />
                  <C.AsyncAutocompleteSelect
                    label="Project"
                    name="destinationProjects"
                    fnPromise={
                      environment.model.projects.getAutocompleteProjects
                    }
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
                        />
                      </StyledFormRow>
                      <C.Section title="Original Currency" type="secondary">
                        <C.TextFieldWrapper
                          label="Funding Amount (original currency)"
                          name="amountOriginal"
                          type="currency"
                        />
                        <C.TextFieldWrapper
                          label="Exchange Rate Used"
                          name="exchangeRateUsed"
                          type="text"
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
                            return true;
                          }}
                          color="primary"
                          text="Calculate the exchange rate"
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
                        <C.TextFieldWrapper
                          label="Donor Budget Year"
                          name="budgetYear"
                          type="number"
                        />
                      </StyledFormRow>
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
                      <C.AsyncSingleSelect
                        label="Gb Earmarking"
                        name="earmarkingType"
                        fnPromise={environment.model.categories.getCategories}
                        category="earmarkingType"
                        hasNameValue
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
              <C.FormSection title="Linked Flows">
                <StyledRow>
                  <C.Button
                    onClick={() => {
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
                      return true;
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
                      <C.DatePicker name="reportedDate" label="Date Reported" />
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
