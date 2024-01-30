import { Form, Formik, FormikState, useFormikContext } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { C } from '@unocha/hpc-ui';
import { Environment } from '../../environments/interface';
import { Query } from './flows-table';
import {
  decodeFilters,
  encodeFilters,
  parseActiveFilters,
  parseInitialValues,
} from '../utils/parse-filters';

interface Props {
  environment: Environment;
  query: Query;
  setQuery: (newQuery: Query) => void;
}
export interface FlowsFilterValues {
  flowID?: string;
  amountUSD?: string;
  keywords?: { label: string; id: string }[];
  flowStatus?: string;
  flowType?: string;
  flowActiveStatus?: string;
  reporterRefCode?: string;
  sourceSystemID?: string;
  flowLegacyID?: string;
  sourceOrganizations?: { label: string; id: string }[];
  sourceCountries?: { label: string; id: string }[];
  sourceUsageYears?: { label: string; id: string }[];
  sourceProjects?: { label: string; id: string }[];
  sourcePlans?: { label: string; id: string }[];
  sourceGlobalClusters?: { label: string; id: string }[];
  sourceEmergencies?: { label: string; id: string }[];
  destinationOrganizations?: { label: string; id: string }[];
  destinationCountries?: { label: string; id: string }[];
  destinationUsageYears?: { label: string; id: string }[];
  destinationProjects?: { label: string; id: string }[];
  destinationPlans?: { label: string; id: string }[];
  destinationGlobalClusters?: { label: string; id: string }[];
  destinationEmergencies?: { label: string; id: string }[];
  includeChildrenOfParkedFlows?: boolean;
}
export const FLOWS_FILTER_INITIAL_VALUES: FlowsFilterValues = {
  flowID: '',
  amountUSD: '',
  keywords: [],
  flowStatus: '',
  flowType: '',
  flowActiveStatus: '',
  reporterRefCode: '',
  sourceSystemID: '',
  flowLegacyID: '',
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
  includeChildrenOfParkedFlows: false,
};

const StyledDiv = tw.div`
my-6
me-4
lg:flex
justify-end
gap-x-4 
`;

const FormValuesUpdater = ({
  filterValues,
}: {
  filterValues: FlowsFilterValues;
}) => {
  const { setFieldValue, submitForm } = useFormikContext();

  useEffect(() => {
    if (filterValues) {
      Object.entries(filterValues).forEach(([field, value]) => {
        setFieldValue(field, value, false);
      });

      setTimeout(() => {
        submitForm();
      }, 0);
    }
  }, [filterValues, setFieldValue]);

  return null;
};

export const FilterFlowsTable = (props: Props) => {
  const { environment, setQuery, query } = props;
  const location = useLocation();
  const [initialFlowFilterValues, setInitialFlowFilterValues] =
    useState<FlowsFilterValues>(FLOWS_FILTER_INITIAL_VALUES);
  const FORM_VALIDATION = object().shape({
    flowID: number()
      .positive()
      .integer()
      .typeError('Only positive integers are accepted'),
    amountUSD: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    keywords: array().of(object().shape({ label: string(), id: string() })),
    flowStatus: string(),
    reporterRefCode: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    sourceSystemID: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    flowLegacyID: number()
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
  const handleSubmit = (values: FlowsFilterValues) => {
    setQuery({
      ...query,
      page: 0,
      filters: encodeFilters(parseActiveFilters(values).activeFormValues),
    });
  };
  const handleResetForm = (
    formikResetForm: (
      nextState?: Partial<FormikState<FlowsFilterValues>>
    ) => void
  ) => {
    formikResetForm();
    setQuery({
      ...query,
      page: 0,
      filters: encodeFilters(
        parseActiveFilters(FLOWS_FILTER_INITIAL_VALUES).activeFormValues
      ),
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const sourceLocations = searchParams.get('source_location')?.split(',');
    const sourceOrganizations = searchParams
      .get('source_organization')
      ?.split(',');
    const destinationOrganizations = searchParams
      .get('destination_organization')
      ?.split(',');
    const destinationPlans = searchParams.get('destination_plan')?.split(',');

    (async () => {
      try {
        if (sourceLocations && sourceLocations.length > 0) {
          const response = await Promise.all(
            sourceLocations.map((id) =>
              environment.model.locations.getLocation(parseInt(id))
            )
          );
          initialFlowFilterValues.sourceCountries = response.map(
            (location) => ({
              id: '' + location.id,
              label: location.name,
            })
          );
        }
        if (sourceOrganizations && sourceOrganizations.length > 0) {
          const response = await Promise.all(
            sourceOrganizations.map((id) =>
              environment.model.organizations.getOrganization(parseInt(id))
            )
          );
          initialFlowFilterValues.sourceOrganizations = response.map(
            (organizations) => ({
              id: '' + organizations[0].id,
              label: `${organizations[0].name} [${organizations[0].abbreviation}]`,
            })
          );
        }
        if (destinationOrganizations && destinationOrganizations.length > 0) {
          const response = await Promise.all(
            destinationOrganizations.map((id) =>
              environment.model.organizations.getOrganization(parseInt(id))
            )
          );
          initialFlowFilterValues.destinationOrganizations = response.map(
            (organizations) => ({
              id: '' + organizations[0].id,
              label: `${organizations[0].name} [${organizations[0].abbreviation}]`,
            })
          );
        }
        if (destinationPlans && destinationPlans.length > 0) {
          const response = await Promise.all(
            destinationPlans.map((id) =>
              environment.model.plans.getPlan(parseInt(id))
            )
          );
          initialFlowFilterValues.destinationPlans = response.map((plan) => ({
            id: '' + plan.id,
            label: plan.planVersion.name,
          }));
        }
        setInitialFlowFilterValues({ ...initialFlowFilterValues });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [location]);
  return (
    <C.SearchFilter title="Filters">
      <Formik
        enableReinitialize
        initialValues={parseInitialValues(
          decodeFilters(query.filters, FLOWS_FILTER_INITIAL_VALUES),
          FLOWS_FILTER_INITIAL_VALUES
        )}
        validationSchema={FORM_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <FormValuesUpdater filterValues={initialFlowFilterValues} />
            <StyledDiv>
              <C.ButtonSubmit color="primary" text="Search" />
              <C.Button
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text="Clear Fields"
              />
            </StyledDiv>
            <C.Section title="Flow Details">
              <C.TextFieldWrapper label="Flow ID" name="flowID" type="number" />
              <C.TextFieldWrapper
                label="Amount USD"
                name="amountUSD"
                type="currency"
              />
              <C.AsyncAutocompleteSelect
                label="Keywords"
                name="keywords"
                fnPromise={environment.model.categories.getCategories}
                category="keywords"
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section title="Show More" type="secondary">
                <C.AsyncSingleSelect
                  label="Flow Status"
                  name="flowStatus"
                  fnPromise={environment.model.categories.getCategories}
                  category="flowStatus"
                  hasNameValue
                />
                <C.AsyncSingleSelect
                  label="Flow Type"
                  name="flowType"
                  fnPromise={environment.model.categories.getCategories}
                  category="flowType"
                  hasNameValue
                />
                <C.SingleSelect
                  label="Flow Active Status"
                  name="flowActiveStatus"
                  options={[
                    { name: 'Active', value: 'Active' },
                    { name: 'All', value: 'All' },
                    { name: 'Inactive', value: 'Inactive' },
                  ]}
                />
                <C.TextFieldWrapper
                  label="Reporter Reference Code"
                  name="reporterRefCode"
                  type="number"
                />
                <C.TextFieldWrapper
                  label="Source System ID"
                  name="sourceSystemID"
                  type="number"
                />
                <C.TextFieldWrapper
                  label="Flow Legacy ID"
                  name="flowLegacyID"
                  type="number"
                />
              </C.Section>
            </C.Section>
            <C.Section title="Source Details">
              <C.AsyncAutocompleteSelect
                label="Organization(s)"
                name="sourceOrganizations"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label="Country"
                name="sourceCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label="Usage Year(s)"
                name="sourceUsageYears"
                fnPromise={environment.model.usageYears.getUsageYears}
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section title="Show more" type="secondary">
                <C.AsyncAutocompleteSelect
                  label="Project(s)"
                  name="sourceProjects"
                  fnPromise={environment.model.projects.getAutocompleteProjects}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Plan(s)"
                  name="sourcePlans"
                  fnPromise={environment.model.plans.getAutocompletePlans}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Global Cluster(s)"
                  name="sourceGlobalClusters"
                  fnPromise={environment.model.globalClusters.getGlobalClusters}
                  isMulti
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label="Emergency(ies)"
                  name="sourceEmergencies"
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
                name="destinationOrganizations"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label="Country"
                name="destinationCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label="Usage Year(s)"
                name="destinationUsageYears"
                fnPromise={environment.model.usageYears.getUsageYears}
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section title="Show more" type="secondary">
                <C.AsyncAutocompleteSelect
                  label="Project(s)"
                  name="destinationProjects"
                  fnPromise={environment.model.projects.getAutocompleteProjects}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Plan(s)"
                  name="destinationPlans"
                  fnPromise={environment.model.plans.getAutocompletePlans}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label="Global Cluster(s)"
                  name="destinationGlobalClusters"
                  fnPromise={environment.model.globalClusters.getGlobalClusters}
                  isMulti
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label="Emergency(ies)"
                  name="destinationEmergencies"
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
            />
            <StyledDiv>
              <C.ButtonSubmit color="primary" text="Search" />
              <C.Button
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text="Clear Fields"
              />
            </StyledDiv>
          </Form>
        )}
      </Formik>
    </C.SearchFilter>
  );
};
export default FilterFlowsTable;
