import { Form, Formik } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';
import React from 'react';

import { C } from '@unocha/hpc-ui';
import { Environment } from '../../environments/interface';
import { flows } from '@unocha/hpc-data';
import { formValueToId, formValueToLabel } from '../utils/mapFunctions';

interface Props {
  environment: Environment;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}
interface FormValues {
  flowDetailsFlowId: string;
  flowDetailsAmountUSD: string;
  flowDetailsKeywords: { label: string; id: string }[];
  flowDetailsFlowStatus: string;
  flowDetailsFlowType: string;
  flowDetailsFlowActiveStatus: string;
  flowDetailsFlowReporterReferenceCode: string;
  flowDetailsFlowSourceSystemId: string;
  flowDetailsFlowLegacyId: string;
  sourceDetailsOrganizations: { label: string; id: string }[];
  sourceDetailsCountry: { label: string; id: string }[];
  sourceDetailsUsageYears: { label: string; id: string }[];
  sourceDetailsProjects: { label: string; id: string }[];
  sourceDetailsPlans: { label: string; id: string }[];
  sourceDetailsGlobalClusters: { label: string; id: string }[];
  sourceDetailsEmergencies: { label: string; id: string }[];
  destinationDetailsOrganizations: { label: string; id: string }[];
  destinationDetailsCountry: { label: string; id: string }[];
  destinationDetailsUsageYears: { label: string; id: string }[];
  destinationDetailsProjects: { label: string; id: string }[];
  destinationDetailsPlans: { label: string; id: string }[];
  destinationDetailsGlobalClusters: { label: string; id: string }[];
  destinationDetailsEmergencies: { label: string; id: string }[];
  includeChildrenOfParkedFlows: boolean;
}

const StyledDiv = tw.div`
my-6
me-4
lg:flex
justify-end
gap-x-4 
`;

export const FilterTable = (props: Props) => {
  const { environment, setFilters } = props;
  const handleSubmit = (values: FormValues) => {
    const {
      destinationDetailsCountry,
      destinationDetailsOrganizations,
      destinationDetailsUsageYears,
      destinationDetailsProjects,
      destinationDetailsPlans,
      destinationDetailsGlobalClusters,
      destinationDetailsEmergencies,
      flowDetailsAmountUSD,
      flowDetailsFlowId,
      flowDetailsKeywords,
      flowDetailsFlowStatus,
      flowDetailsFlowType,
      flowDetailsFlowActiveStatus,
      flowDetailsFlowReporterReferenceCode,
      flowDetailsFlowSourceSystemId,
      flowDetailsFlowLegacyId,
      sourceDetailsCountry,
      sourceDetailsOrganizations,
      sourceDetailsUsageYears,
      sourceDetailsProjects,
      sourceDetailsPlans,
      sourceDetailsGlobalClusters,
      sourceDetailsEmergencies,
      includeChildrenOfParkedFlows,
    } = values;
    const queryParams: flows.SearchFlowsGraphQlParams = {
      flowSearch: {
        filters: {
          flowId: flowDetailsFlowId,
          keywords: formValueToLabel(flowDetailsKeywords),
          amountUSD:
            flowDetailsAmountUSD === '' ? null : parseInt(flowDetailsAmountUSD), // FIX NaN and null problem
          flowStatus: flowDetailsFlowStatus,
          flowType: flowDetailsFlowType,
          flowActiveStatus: flowDetailsFlowActiveStatus,
          reporterReferenceCode:
            flowDetailsFlowReporterReferenceCode === ''
              ? null
              : parseInt(flowDetailsFlowReporterReferenceCode),
          sourceSystemId:
            flowDetailsFlowSourceSystemId === ''
              ? null
              : parseInt(flowDetailsFlowSourceSystemId),
          flowLegacyId:
            flowDetailsFlowLegacyId === ''
              ? null
              : parseInt(flowDetailsFlowLegacyId),
          destinationCountries: formValueToId(destinationDetailsCountry),
          destinationOrganizations: formValueToId(
            destinationDetailsOrganizations
          ),
          destinationProjects: formValueToId(destinationDetailsProjects),
          destinationPlans: formValueToId(destinationDetailsPlans),
          destinationGlobalClusters: formValueToId(
            destinationDetailsGlobalClusters
          ),
          destinationEmergencies: formValueToId(destinationDetailsEmergencies),
          destinationUsageYears: formValueToId(destinationDetailsUsageYears),
          sourceCountries: formValueToId(sourceDetailsCountry),
          sourceOrganizations: formValueToId(sourceDetailsOrganizations),
          sourceUsageYears: formValueToId(sourceDetailsUsageYears),
          sourceProjects: formValueToId(sourceDetailsProjects),
          sourcePlans: formValueToId(sourceDetailsPlans),
          sourceGlobalClusters: formValueToId(sourceDetailsGlobalClusters),
          sourceEmergencies: formValueToId(sourceDetailsEmergencies),
          includeChildrenOfParkedFlows,
        },
      },
    };

    console.log(queryParams);
    setFilters(queryParams);
  };

  const FORM_VALIDATION = object().shape({
    flowDetailsFlowId: number()
      .positive()
      .integer()
      .typeError('Only positive integers are accepted'),
    flowDetailsAmountUSD: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    flowDetailsKeywords: array().of(
      object().shape({ label: string(), id: string() })
    ),
    flowDetailsFlowStatus: string(),
    flowDetailsFlowReporterReferenceCode: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    flowDetailsFlowSourceSystemId: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    flowDetailsFlowLegacyId: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    sourceDetailsOrganizations: array().of(
      object().shape({ label: string(), id: string() })
    ),
    sourceDetailsCountry: array().of(
      object().shape({ label: string(), id: string() })
    ),
    sourceDetailsUsageYears: array().of(
      object().shape({ label: string(), id: string() })
    ),
    destinationDetailsOrganizations: array().of(
      object().shape({ label: string(), id: string() })
    ),
    destinationDetailsCountry: array().of(
      object().shape({ label: string(), id: string() })
    ),
    destinationDetailsUsageYears: array().of(
      object().shape({ label: string(), id: string() })
    ),
  });

  return (
    <C.SearchFilter title="Filters">
      <Formik
        initialValues={{
          flowDetailsFlowId: '',
          flowDetailsAmountUSD: '',
          flowDetailsKeywords: [],
          flowDetailsFlowStatus: '',
          flowDetailsFlowType: '',
          flowDetailsFlowActiveStatus: '',
          flowDetailsFlowReporterReferenceCode: '',
          flowDetailsFlowSourceSystemId: '',
          flowDetailsFlowLegacyId: '',
          sourceDetailsOrganizations: [],
          sourceDetailsCountry: [],
          sourceDetailsUsageYears: [],
          sourceDetailsProjects: [],
          sourceDetailsPlans: [],
          sourceDetailsGlobalClusters: [],
          sourceDetailsEmergencies: [],
          destinationDetailsOrganizations: [],
          destinationDetailsCountry: [],
          destinationDetailsUsageYears: [],
          destinationDetailsProjects: [],
          destinationDetailsPlans: [],
          destinationDetailsGlobalClusters: [],
          destinationDetailsEmergencies: [],
          includeChildrenOfParkedFlows: true,
        }}
        validationSchema={FORM_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <StyledDiv>
              <C.ButtonSubmit color="primary" text="Search" />
              <C.Button
                color="neutral"
                onClick={() => resetForm()}
                text="Clear Fields"
              />
            </StyledDiv>
            <C.Section title="Flow Details">
              <C.TextFieldWrapper
                label="Flow Id"
                name="flowDetailsFlowId"
                type="text"
              />
              <C.TextFieldWrapper
                label="Amount USD"
                name="flowDetailsAmountUSD"
                type="number"
              />

              <C.AsyncAutocompleteSelect
                label="Keywords"
                name="flowDetailsKeywords"
                fnPromise={environment.model.categories.getCategories}
                category="keywords"
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section title="Show More" type="secondary">
                <C.AsyncSingleSelect
                  label="Flow Status"
                  name="flowDetailsFlowStatus"
                  fnPromise={environment.model.categories.getCategories}
                  category="flowStatus"
                  hasNameValue
                />
                <C.AsyncSingleSelect
                  label="Flow Type"
                  name="flowDetailsFlowType"
                  fnPromise={environment.model.categories.getCategories}
                  category="flowType"
                  hasNameValue
                />
                <C.SingleSelect
                  label="Flow Active Status"
                  name="flowDetailsFlowActiveStatus"
                  options={[
                    { name: 'Active', value: 'Active' },
                    { name: 'All', value: 'All' },
                    { name: 'Inactive', value: 'Inactive' },
                  ]}
                />
                <C.TextFieldWrapper
                  label="Reporter Reference Code"
                  name="flowDetailsFlowReporterReferenceCode"
                  type="number"
                />
                <C.TextFieldWrapper
                  label="Source System ID"
                  name="flowDetailsFlowSourceSystemId"
                  type="number"
                />
                <C.TextFieldWrapper
                  label="Flow Legacy ID"
                  name="flowDetailsFlowLegacyId"
                  type="number"
                />
              </C.Section>
            </C.Section>
            <C.Section title="Source Details">
              <C.AsyncAutocompleteSelect
                label="Organization(s)"
                name="sourceDetailsOrganizations"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label="Country"
                name="sourceDetailsCountry"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label="Usage Year(s)"
                name="sourceDetailsUsageYears"
                fnPromise={environment.model.usageYears.getUsageYears}
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section title="Show more" type="secondary">
                <C.AsyncAutocompleteSelect
                  label="Project(s)"
                  name="sourceDetailsProjects"
                  fnPromise={environment.model.projects.getAutocompleteProjects}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Plan(s)"
                  name="sourceDetailsPlans"
                  fnPromise={environment.model.plans.getAutocompletePlans}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Global Cluster(s)"
                  name="sourceDetailsGlobalClusters"
                  fnPromise={environment.model.globalClusters.getGlobalClusters}
                  isMulti
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label="Emergency(ies)"
                  name="sourceDetailsEmergencies"
                  fnPromise={
                    environment.model.emergencies.getAutocompleteEmergencies
                  }
                  isMulti
                />
              </C.Section>
            </C.Section>
            <C.Section title="Destination Details">
              <C.AsyncAutocompleteSelect
                label="Organization(s)"
                name="destinationDetailsOrganizations"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label="Country"
                name="destinationDetailsCountry"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label="Usage Year(s)"
                name="destinationDetailsUsageYears"
                fnPromise={environment.model.usageYears.getUsageYears}
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section title="Show more" type="secondary">
                <C.AsyncAutocompleteSelect
                  label="Project(s)"
                  name="destinationDetailsProjects"
                  fnPromise={environment.model.projects.getAutocompleteProjects}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Plan(s)"
                  name="destinationDetailsPlans"
                  fnPromise={environment.model.plans.getAutocompletePlans}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Global Cluster(s)"
                  name="destinationDetailsGlobalClusters"
                  fnPromise={environment.model.globalClusters.getGlobalClusters}
                  isMulti
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label="Emergency(ies)"
                  name="destinationDetailsEmergencies"
                  fnPromise={
                    environment.model.emergencies.getAutocompleteEmergencies
                  }
                  isMulti
                />
              </C.Section>
            </C.Section>
            <C.CheckBox
              label="Include children of matching parked flows"
              name="includeChildrenOfParkedFlows"
              size="small"
              defaultChecked
            />
            <StyledDiv>
              <C.ButtonSubmit color="primary" text="Search" />
              <C.Button
                color="neutral"
                onClick={() => resetForm()}
                text="Clear Fields"
              />
            </StyledDiv>
          </Form>
        )}
      </Formik>
    </C.SearchFilter>
  );
};
export default FilterTable;
