import { Form, Formik, FormikState } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';
import React, { useState } from 'react';

import { C } from '@unocha/hpc-ui';
import { Environment } from '../../environments/interface';
import { Query } from './flows-table';
import {
  FormObjectValue,
  decodeFilters,
  encodeFilters,
  parseActiveFilters,
  parseFormFiltersRebuilt,
  parseInitialValues,
} from '../utils/parse-filters';
import { LanguageKey, t } from '../../i18n';
import {
  InfoSettings,
  LocalStorageFTSAdminKey,
} from '../utils/local-storage-type';
import { util } from '@unocha/hpc-core';
import { Alert } from '@mui/material';

interface Props {
  environment: Environment;
  lang: LanguageKey;
  query: Query;
  setQuery: (newQuery: Query) => void;
}
export interface FlowsFilterValues {
  flowID?: string[];
  amountUSD?: string;
  keywords?: Array<FormObjectValue>;
  flowStatus?: string;
  flowType?: string;
  flowActiveStatus?: string;
  reporterRefCode?: string;
  sourceSystemID?: string;
  legacyID?: string;
  sourceOrganizations?: Array<FormObjectValue>;
  sourceCountries?: Array<FormObjectValue>;
  sourceUsageYears?: Array<FormObjectValue>;
  sourceProjects?: Array<FormObjectValue>;
  sourcePlans?: Array<FormObjectValue>;
  sourceGlobalClusters?: Array<FormObjectValue>;
  sourceEmergencies?: Array<FormObjectValue>;
  destinationOrganizations?: Array<FormObjectValue>;
  destinationCountries?: Array<FormObjectValue>;
  destinationUsageYears?: Array<FormObjectValue>;
  destinationProjects?: Array<FormObjectValue>;
  destinationPlans?: Array<FormObjectValue>;
  destinationGlobalClusters?: Array<FormObjectValue>;
  destinationEmergencies?: Array<FormObjectValue>;
  includeChildrenOfParkedFlows?: boolean;
}
export const FLOWS_FILTER_INITIAL_VALUES: FlowsFilterValues = {
  flowID: [],
  amountUSD: '',
  keywords: [],
  flowStatus: '',
  flowType: '',
  flowActiveStatus: '',
  reporterRefCode: '',
  sourceSystemID: '',
  legacyID: '',
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
export const FilterFlowsTable = (props: Props) => {
  const { environment, setQuery, query, lang } = props;

  const [tableInfoDisplay, setTableInfoDisplay] = useState(
    util.getLocalStorageItem('infoSettings', true)
  );
  const handleTableSettingsInfoClose = () => {
    util.setLocalStorageItem<InfoSettings, LocalStorageFTSAdminKey>(
      'infoSettings',
      { filterCommaSeparate: false }
    );
    setTableInfoDisplay(false);
  };

  const FORM_VALIDATION = object().shape({
    flowID: array(number().positive().integer()).typeError(
      'Only positive integers are accepted'
    ),
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
    legacyID: number()
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
  return (
    <C.SearchFilter title={t.t(lang, (s) => s.components.flowsFilter.title)}>
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
              title={t.t(
                lang,
                (s) => s.components.flowsFilter.headers.flowDetails
              )}
            >
              <Alert
                severity="info"
                onClose={handleTableSettingsInfoClose}
                sx={{
                  display: tableInfoDisplay ? 'flex' : 'none',
                  ...tw` mt-4`,
                }}
              >
                Using ',' sepparated values will create multiple values. Copy
                and paste also works with this functionality
              </Alert>
              <C.MultiTextField
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.flowID
                )}
                name="flowID"
              />
              <C.TextFieldWrapper
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.amountUSD
                )}
                name="amountUSD"
                type="currency"
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.keywords
                )}
                name="keywords"
                fnPromise={environment.model.categories.getCategories}
                category="keywords"
                isMulti
                isAutocompleteAPI={false}
              />
              <C.Section
                title={t.t(lang, (s) => s.components.flowsFilter.showMore)}
                type="secondary"
              >
                <C.AsyncSingleSelect
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
                    return response.map((responseValue) => {
                      return {
                        label: responseValue.name,
                        id: responseValue.id,
                      };
                    });
                  }}
                  hasNameValue
                />
                <C.AsyncSingleSelect
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
                        label: responseValue.name,
                        id: responseValue.id,
                      };
                    });
                  }}
                  hasNameValue
                />
                <C.SingleSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.flowActiveStatus
                  )}
                  name="flowActiveStatus"
                  options={[
                    { name: 'Active', value: 'Active' },
                    { name: 'All', value: 'All' },
                    { name: 'Inactive', value: 'Inactive' },
                  ]}
                />
                <C.TextFieldWrapper
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.reporterRefCode
                  )}
                  name="reporterRefCode"
                  type="number"
                />
                <C.TextFieldWrapper
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourceSystemID
                  )}
                  name="sourceSystemID"
                  type="number"
                />
                <C.TextFieldWrapper
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
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.sourceCountries
                )}
                name="sourceCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.sourceUsageYears
                )}
                name="sourceUsageYears"
                fnPromise={environment.model.usageYears.getUsageYears}
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
                  fnPromise={environment.model.projects.getAutocompleteProjects}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourcePlans
                  )}
                  name="sourcePlans"
                  fnPromise={environment.model.plans.getAutocompletePlans}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourceGlobalClusters
                  )}
                  name="sourceGlobalClusters"
                  fnPromise={environment.model.globalClusters.getGlobalClusters}
                  isMulti
                  isAutocompleteAPI={false}
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.sourceEmergencies
                  )}
                  name="sourceEmergencies"
                  fnPromise={
                    environment.model.emergencies.getAutocompleteEmergencies
                  }
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
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.destinationCountries
                )}
                name="destinationCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />

              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.flowsFilter.filters.destinationUsageYears
                )}
                name="destinationUsageYears"
                fnPromise={environment.model.usageYears.getUsageYears}
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
                  fnPromise={environment.model.projects.getAutocompleteProjects}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) => s.components.flowsFilter.filters.destinationPlans
                  )}
                  name="destinationPlans"
                  fnPromise={environment.model.plans.getAutocompletePlans}
                  isMulti
                />
                <C.AsyncAutocompleteSelect
                  label={t.t(
                    lang,
                    (s) =>
                      s.components.flowsFilter.filters.destinationGlobalClusters
                  )}
                  name="destinationGlobalClusters"
                  fnPromise={environment.model.globalClusters.getGlobalClusters}
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
                  fnPromise={
                    environment.model.emergencies.getAutocompleteEmergencies
                  }
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
export default FilterFlowsTable;
