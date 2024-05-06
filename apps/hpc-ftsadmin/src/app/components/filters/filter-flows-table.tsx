import { Form, Formik, FormikState } from 'formik';
import * as io from 'io-ts';
import tw from 'twin.macro';
import { useContext } from 'react';

import { C } from '@unocha/hpc-ui';
import { decodeFilters, encodeFilters } from '../../utils/parse-filters';
import { t } from '../../../i18n';
import { Query } from '../tables/table-utils';
import { AppContext } from '../../context';
import { util as codecs, FormObjectValue } from '@unocha/hpc-data';
import validateForm from '../../utils/form-validation';
import {
  fnCategories,
  fnEmergencies,
  fnGlobalClusters,
  fnLocations,
  fnOrganizations,
  fnPlans,
  fnProjects,
  fnUsageYears,
} from '../../utils/fn-promises';
import InfoAlert from '../info-alert';

interface Props {
  query: Query;
  setQuery: (newQuery: Query) => void;
  handleAbortController: () => void;
}
export interface FlowsFilterValues {
  flowID?: string[];
  amountUSD?: string;
  keywords?: Array<FormObjectValue>;
  flowStatus?: FormObjectValue | null;
  flowType?: FormObjectValue | null;
  flowActiveStatus?: FormObjectValue;
  reporterRefCode?: string;
  sourceSystemID?: string;
  legacyID?: string;
  sourceOrganizations?: Array<FormObjectValue>;
  sourceLocations?: Array<FormObjectValue>;
  sourceUsageYears?: Array<FormObjectValue>;
  sourceProjects?: Array<FormObjectValue>;
  sourcePlans?: Array<FormObjectValue>;
  sourceGlobalClusters?: Array<FormObjectValue>;
  sourceEmergencies?: Array<FormObjectValue>;
  destinationOrganizations?: Array<FormObjectValue>;
  destinationLocations?: Array<FormObjectValue>;
  destinationUsageYears?: Array<FormObjectValue>;
  destinationProjects?: Array<FormObjectValue>;
  destinationPlans?: Array<FormObjectValue>;
  destinationGlobalClusters?: Array<FormObjectValue>;
  destinationEmergencies?: Array<FormObjectValue>;
  includeChildrenOfParkedFlows?: boolean;
  restricted?: boolean;
}
export const FLOWS_FILTER_INITIAL_VALUES: FlowsFilterValues = {
  flowID: [],
  amountUSD: '',
  keywords: [],
  flowStatus: null,
  flowType: null,
  flowActiveStatus: { displayLabel: 'Active', value: 'true' },
  reporterRefCode: '',
  sourceSystemID: '',
  legacyID: '',
  sourceOrganizations: [],
  sourceLocations: [],
  sourceUsageYears: [],
  sourceProjects: [],
  sourcePlans: [],
  sourceGlobalClusters: [],
  sourceEmergencies: [],
  destinationOrganizations: [],
  destinationLocations: [],
  destinationUsageYears: [],
  destinationProjects: [],
  destinationPlans: [],
  destinationGlobalClusters: [],
  destinationEmergencies: [],
  includeChildrenOfParkedFlows: true,
  restricted: false,
};

const FORM_VALIDATION = io.partial({
  flowID: io.array(codecs.POSITIVE_INTEGER_FROM_STRING),
});

const StyledDiv = tw.div`
  my-6
  me-4
  lg:flex
  justify-end
  gap-x-4
`;
export const FilterFlowsTable = (props: Props) => {
  const { setQuery, query, handleAbortController } = props;

  const { lang, env } = useContext(AppContext);
  const environment = env();

  const queryFilters = decodeFilters(
    query.filters,
    FLOWS_FILTER_INITIAL_VALUES
  );
  const handleSubmit = (values: FlowsFilterValues) => {
    const encodedFilters = encodeFilters(values, FLOWS_FILTER_INITIAL_VALUES);

    if (query.filters !== encodedFilters) {
      handleAbortController();
    }
    setQuery({
      ...query,
      page: 0,
      filters: encodedFilters,
    });
  };
  const handleResetForm = (
    formikResetForm: (
      nextState?: Partial<FormikState<FlowsFilterValues>>
    ) => void
  ) => {
    const encodedFilters = encodeFilters({}, FLOWS_FILTER_INITIAL_VALUES);
    formikResetForm();

    if (query.filters !== encodedFilters) {
      handleAbortController();
    }
    setQuery({
      ...query,
      page: 0,
      filters: encodedFilters,
    });
  };
  return (
    <C.SearchFilter title={t.t(lang, (s) => s.components.flowsFilter.title)}>
      <Formik
        enableReinitialize
        initialValues={queryFilters}
        validate={(values) => validateForm(values, FORM_VALIDATION)}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <StyledDiv>
              <C.ButtonSubmit
                color="primary"
                text={t.t(lang, (s) => s.components.flowsFilter.button.primary)}
              />
              <C.ButtonSubmit
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text={t.t(
                  lang,
                  (s) => s.components.flowsFilter.button.secondary
                )}
              />
            </StyledDiv>
            <C.Switch
              name="restricted"
              label={t.t(
                lang,
                (s) => s.components.flowsFilter.filters.restricted
              )}
              color="error"
            />
            <C.Section
              title={t.t(
                lang,
                (s) => s.components.flowsFilter.headers.flowDetails
              )}
            >
              <InfoAlert
                text={t.t(
                  lang,
                  (s) => s.components.flowsFilter.info.filterInfo
                )}
                localStorageKey="filterCommaSeparate"
                sxProps={tw`mt-4`}
              />
              <C.MultiTextField
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.flowID
                )}
                name="flowID"
                errorMessage={t.t(
                  lang,
                  (s) => s.components.flowsFilter.errors.flowID
                )}
              />
              <C.NumberField
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.amountUSD
                )}
                name="amountUSD"
                allowNegative
                type="currency"
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.keywords
                )}
                name="keywords"
                fnPromise={() => fnCategories('keywords', environment)}
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section
                title={t.t(lang, (s) => s.components.flowsFilter.showMore)}
                type="secondary"
              >
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.flowStatus
                  )}
                  name="flowStatus"
                  fnPromise={async () => {
                    const response =
                      await environment.model.categories.getCategories({
                        query: 'flowStatus',
                      });
                    return response.map((responseValue): FormObjectValue => {
                      return {
                        displayLabel: responseValue.name,
                        value: responseValue.name
                          .toLowerCase()
                          .replace(' ', '_'),
                      };
                    });
                  }}
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.flowType
                  )}
                  name="flowType"
                  fnPromise={async () => {
                    const response =
                      await environment.model.categories.getCategories({
                        query: 'flowType',
                      });
                    return response.map((responseValue) => {
                      return {
                        displayLabel: responseValue.name,
                        value: responseValue.name
                          .toLocaleLowerCase()
                          .replace(' ', '_'),
                      };
                    });
                  }}
                  isAutocompleteAPI={false}
                />
                <C.AutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.flowActiveStatus
                  )}
                  name="flowActiveStatus"
                  options={[
                    { displayLabel: 'Active', value: 'true' },
                    { displayLabel: 'All', value: 'All' },
                    { displayLabel: 'Inactive', value: 'false' },
                  ]}
                />
                <C.TextFieldWrapper
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.reporterRefCode
                  )}
                  name="reporterRefCode"
                />
                <C.NumberField
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourceSystemID
                  )}
                  name="sourceSystemID"
                  allowNegative
                  type="number"
                />
                <C.NumberField
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.legacyID
                  )}
                  name="legacyID"
                  type="number"
                />
              </C.Section>
            </C.Section>
            <C.Section
              title={t.t(
                lang,
                (s) => s.components.flowsFilter.headers.sourceDetails
              )}
            >
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.sourceOrganizations
                )}
                name="sourceOrganizations"
                fnPromise={(query) => fnOrganizations(query, environment)}
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.sourceLocations
                )}
                name="sourceLocations"
                fnPromise={(query) => fnLocations(query, environment)}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.sourceUsageYears
                )}
                name="sourceUsageYears"
                fnPromise={() => fnUsageYears(environment)}
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section
                title={t.t(lang, (s) => s.components.flowsFilter.showMore)}
                type="secondary"
              >
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourceProjects
                  )}
                  name="sourceProjects"
                  fnPromise={(query) => fnProjects(query, environment)}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourcePlans
                  )}
                  name="sourcePlans"
                  fnPromise={(query) => fnPlans(query, environment)}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourceGlobalClusters
                  )}
                  name="sourceGlobalClusters"
                  fnPromise={() => fnGlobalClusters(environment)}
                  isMulti
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourceEmergencies
                  )}
                  name="sourceEmergencies"
                  fnPromise={(query) => fnEmergencies(query, environment)}
                  isMulti
                />
              </C.Section>
            </C.Section>
            <C.Section
              title={t.t(
                lang,
                (s) => s.components.flowsFilter.headers.destinationDetails
              )}
            >
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowsFilter.filters.destinationOrganizations
                )}
                name="destinationOrganizations"
                fnPromise={(query) => fnOrganizations(query, environment)}
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.destinationLocations
                )}
                name="destinationLocations"
                fnPromise={(query) => fnLocations(query, environment)}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.destinationUsageYears
                )}
                name="destinationUsageYears"
                fnPromise={() => fnUsageYears(environment)}
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section
                title={t.t(lang, (s) => s.components.flowsFilter.showMore)}
                type="secondary"
              >
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.destinationProjects
                  )}
                  name="destinationProjects"
                  fnPromise={(query) => fnProjects(query, environment)}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.destinationPlans
                  )}
                  name="destinationPlans"
                  fnPromise={(query) => fnPlans(query, environment)}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) =>
                      s.components.flowsFilter.filters.destinationGlobalClusters
                  )}
                  name="destinationGlobalClusters"
                  fnPromise={() => fnGlobalClusters(environment)}
                  isMulti
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) =>
                      s.components.flowsFilter.filters.destinationEmergencies
                  )}
                  name="destinationEmergencies"
                  fnPromise={(query) => fnEmergencies(query, environment)}
                  isMulti
                />
              </C.Section>
            </C.Section>
            <C.CheckBox
              label={t.t(
                lang,
                (s) =>
                  s.components.flowsFilter.filters.includeChildrenOfParkedFlows
              )}
              name="includeChildrenOfParkedFlows"
              size="small"
            />
            <StyledDiv>
              <C.ButtonSubmit
                color="primary"
                text={t.t(lang, (s) => s.components.flowsFilter.button.primary)}
              />
              <C.ButtonSubmit
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
export default FilterFlowsTable;
