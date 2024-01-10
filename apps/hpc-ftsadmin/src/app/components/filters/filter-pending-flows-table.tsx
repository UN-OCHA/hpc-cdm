import { Form, Formik, FormikState } from 'formik';
import { array, number, object, string } from 'yup';
import tw from 'twin.macro';

import { C } from '@unocha/hpc-ui';
import {
  FormObjectValue,
  decodeFilters,
  encodeFilters,
} from '../../utils/parse-filters';
import { t } from '../../../i18n';
import { Query } from '../tables/table-utils';
import { useContext } from 'react';
import { AppContext } from '../../context';

interface Props {
  query: Query;
  setQuery: (newQuery: Query) => void;
  handleAbortController: () => void;
}
export interface PendingFlowsFilterValues {
  status?: string;
  dataProvider?: string;
  reporterRefCode?: string;
  sourceOrganizations?: Array<FormObjectValue>;
  sourceCountries?: Array<FormObjectValue>;
  destinationOrganizations?: Array<FormObjectValue>;
  destinationCountries?: Array<FormObjectValue>;
  destinationUsageYears?: Array<FormObjectValue>;
  includeChildrenOfParkedFlows?: boolean;
}

export const PENDING_FLOWS_FILTER_INITIAL_VALUES: PendingFlowsFilterValues = {
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
  const { setQuery, query, handleAbortController } = props;
  const { lang, env } = useContext(AppContext);
  const environment = env();

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
    const encodedFilters = encodeFilters(
      values,
      PENDING_FLOWS_FILTER_INITIAL_VALUES
    );
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
      nextState?: Partial<FormikState<PendingFlowsFilterValues>>
    ) => void
  ) => {
    const encodedFilters = encodeFilters(
      {},
      PENDING_FLOWS_FILTER_INITIAL_VALUES
    );
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
        initialValues={decodeFilters(
          query.filters,
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
              title={t.t(
                lang,
                (s) => s.components.pendingFlowsFilter.filters.details
              )}
            >
              <C.SingleSelect
                label={t.t(
                  lang,
                  (s) => s.components.pendingFlowsFilter.filters.status
                )}
                name="status"
                options={[
                  { displayLabel: 'New', value: 'New' },
                  { displayLabel: 'Update', value: 'Update' },
                ]}
              />
              <C.AsyncSingleSelect
                label={t.t(
                  lang,
                  (s) => s.components.pendingFlowsFilter.filters.flowType
                )}
                name="dataProvider"
                fnPromise={async () => {
                  const response = await environment.model.systems.getSystems();
                  return response.map((responseValue) => {
                    return {
                      displayLabel: responseValue.systemID,
                      value: responseValue.systemID,
                    };
                  });
                }}
              />
              <C.TextFieldWrapper
                label={t.t(
                  lang,
                  (s) => s.components.pendingFlowsFilter.filters.reporterRefCode
                )}
                name="reporterRefCode"
                type="number"
              />
            </C.Section>
            <C.Section
              title={t.t(
                lang,
                (s) => s.components.pendingFlowsFilter.headers.sourceDetails
              )}
            >
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) =>
                    s.components.pendingFlowsFilter.filters.sourceOrganizations
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
                  (s) => s.components.pendingFlowsFilter.filters.sourceLocations
                )}
                name="sourceCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />
            </C.Section>
            <C.Section
              title={t.t(
                lang,
                (s) =>
                  s.components.pendingFlowsFilter.headers.destinationDetails
              )}
            >
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) =>
                    s.components.pendingFlowsFilter.filters
                      .destinationOrganizations
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
                  (s) =>
                    s.components.pendingFlowsFilter.filters.destinationLocations
                )}
                name="destinationCountries"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) =>
                    s.components.pendingFlowsFilter.filters
                      .destinationUsageYears
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
                  s.components.pendingFlowsFilter.filters
                    .includeChildrenOfParkedFlows
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
