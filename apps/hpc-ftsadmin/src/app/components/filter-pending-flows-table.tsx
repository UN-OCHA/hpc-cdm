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
} from '../utils/parse-filters';
import { LanguageKey, t } from '../../i18n';

interface Props {
  environment: Environment;
  query: Query;
  setQuery: (newQuery: Query) => void;
  lang: LanguageKey;
}
export interface PendingFlowsFilterValues {
  status?: string;
  dataProvider?: string;
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
  dataProvider: '',
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
  const { environment, setQuery, query, lang } = props;
  const FORM_VALIDATION = object().shape({
    flowStatus: string(),
    dataProvider: string(),
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
    <C.SearchFilter title={t.t(lang, (s) => s.components.flowsFilter.title)}>
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
              <C.ButtonSubmit
                color="primary"
                text={t.t(lang, (s) => s.components.flowsFilter.button.primary)}
              />
              <C.Button
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text={t.t(
                  lang,
                  (s) => s.components.flowsFilter.button.secondary
                )}
              />
            </StyledDiv>
            <C.Section
              title={t.t(lang, (s) => s.components.flowsFilter.filters.details)}
            >
              <C.SingleSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.status
                )}
                name="status"
                options={[
                  { name: 'New', value: 'New' },
                  { name: 'Update', value: 'Update' },
                ]}
              />

              {/* Data provider missing here */}
              <C.AsyncSingleSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.flowType
                )}
                name="dataProvider"
                fnPromise={async () => {
                  const response = await environment.model.systems.getSystems();
                  return response.map((responseValue) => {
                    return {
                      label: responseValue.systemID,
                      id: responseValue.systemID,
                    };
                  });
                }}
              />
              <C.TextFieldWrapper
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.reporterReferenceCode
                )}
                name="reporterRefCode"
                type="number"
              />
            </C.Section>
            <C.Section
              title={t.t(
                lang,
                (s) => s.components.flowsFilter.filters.sourceDetails
              )}
            >
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.organizations
                )}
                name="sourceOrganizations"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.countries
                )}
                name="sourceCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />
            </C.Section>
            <C.Section
              title={t.t(
                lang,
                (s) => s.components.flowsFilter.filters.destinationDetails
              )}
            >
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.organizations
                )}
                name="destinationOrganizations"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.countries
                )}
                name="destinationCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.usageYears
                )}
                name="destinationUsageYears"
                fnPromise={environment.model.usageYears.getUsageYears}
                isMulti
                isAutocompleteAPI={false}
              />
            </C.Section>
            <C.CheckBox
              label={t.t(
                lang,
                (s) =>
                  s.components.flowsFilter.filters.includeChildrenParkedFlows
              )}
              name="includeChildrenOfParkedFlows"
              size="small"
            />
            <StyledDiv>
              <C.ButtonSubmit
                color="primary"
                text={t.t(lang, (s) => s.components.flowsFilter.button.primary)}
              />
              <C.Button
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text={t.t(
                  lang,
                  (s) => s.components.flowsFilter.button.secondary
                )}
              />
            </StyledDiv>
          </Form>
        )}
      </Formik>
    </C.SearchFilter>
  );
};
export default FilterPendingFlowsTable;
