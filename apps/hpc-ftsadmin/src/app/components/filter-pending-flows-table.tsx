import { Form, Formik, FormikState } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';

import { C } from '@unocha/hpc-ui';
import { Environment } from '../../environments/interface';
import { Query } from './flows-table';
import {
  decodeFilters,
  encodeFilters,
  parseActiveFilters,
  parseInitialValues,
} from '../utils/parseFilters';

interface Props {
  environment: Environment;
  query: Query;
  setQuery: (newQuery: Query) => void;
}
export interface PendingFlowsFilterValues {
  status?: string;
  reporterRefCode?: string;
  sourceOrganizations?: { label: string; id: string }[];
  sourceCountries?: { label: string; id: string }[];
  destinationOrganizations?: { label: string; id: string }[];
  destinationCountries?: { label: string; id: string }[];
  destinationUsageYears?: { label: string; id: string }[];
  includeChildrenOfParkedFlows?: boolean;
}

export const PENDING_FLOWS_FILTER_INITIAL_VALUES = {
  status: '',
  reporterRefCode: '',
  sourceOrganizations: [],
  sourceCountries: [],
  destinationOrganizations: [],
  destinationCountries: [],
  destinationUsageYears: [],
  includeChildrenOfParkedFlows: false,
};
const StyledDiv = tw.div`
my-6
me-4
lg:flex
justify-end
gap-x-4 
`;
export const FilterPendingFlowsTable = (props: Props) => {
  const { environment, setQuery, query } = props;
  const FORM_VALIDATION = object().shape({
    flowStatus: string(),
    reporterRefCode: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    sourceOrganizations: array().of(
      object().shape({ label: string(), id: string() })
    ),
    sourceCountries: array().of(
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
  const handleSubmit = (values: PendingFlowsFilterValues) => {
    setQuery({
      ...query,
      page: 0,
      filters: encodeFilters(parseActiveFilters(values).activeFormValues),
    });
  };
  const handleResetForm = (
    formikResetForm: (
      nextState?: Partial<FormikState<PendingFlowsFilterValues>>
    ) => void
  ) => {
    formikResetForm();
    setQuery({
      ...query,
      page: 0,
      filters: encodeFilters(
        parseActiveFilters(PENDING_FLOWS_FILTER_INITIAL_VALUES).activeFormValues
      ),
    });
  };
  return (
    <C.SearchFilter title="Filters">
      <Formik
        enableReinitialize
        initialValues={parseInitialValues(
          decodeFilters(query.filters, PENDING_FLOWS_FILTER_INITIAL_VALUES),
          PENDING_FLOWS_FILTER_INITIAL_VALUES
        )}
        validationSchema={FORM_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <StyledDiv>
              <C.ButtonSubmit color="primary" text="Search" />
              <C.Button
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text="Clear Fields"
              />
            </StyledDiv>
            <C.Section title="Details">
              <C.SingleSelect
                label="Status"
                name="status"
                options={[
                  { name: 'New', value: 'New' },
                  { name: 'Update', value: 'Update' },
                ]}
              />
              {/* Data provider missing here */}
              <C.TextFieldWrapper
                label="Reporter Reference Code"
                name="reporterRefCode"
                type="number"
              />
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
export default FilterPendingFlowsTable;
