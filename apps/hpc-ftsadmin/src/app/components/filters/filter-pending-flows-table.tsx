import { Form, Formik, type FormikState } from 'formik';
import tw from 'twin.macro';

import { type util } from '@unocha/hpc-data';
import { C } from '@unocha/hpc-ui';
import { useContext } from 'react';
import { t } from '../../../i18n';
import { AppContext } from '../../context';
import {
  fnLocations,
  fnOrganizations,
  fnUsageYears,
  usageYearFirstViewCondition,
} from '../../utils/fn-promises';
import { decodeFilters, encodeFilters } from '../../utils/parse-filters';
import type { FlowQuery, SetQuery } from '../tables/table-utils';
interface Props {
  query: FlowQuery;
  setQuery: SetQuery<FlowQuery>;
}
export interface PendingFlowsFilterValues {
  status?: util.FormObjectValue | null;
  dataProvider?: util.FormObjectValue | null;
  reporterRefCode?: string;
  sourceOrganizations?: util.FormObjectValue[];
  sourceLocations?: util.FormObjectValue[];
  destinationOrganizations?: util.FormObjectValue[];
  destinationLocations?: util.FormObjectValue[];
  destinationUsageYears?: util.FormObjectValue[];
  includeChildrenOfParkedFlows?: boolean;
}

export const PENDING_FLOWS_FILTER_INITIAL_VALUES: PendingFlowsFilterValues = {
  status: null,
  dataProvider: null,
  reporterRefCode: '',
  sourceOrganizations: [],
  sourceLocations: [],
  destinationOrganizations: [],
  destinationLocations: [],
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
  const { setQuery, query } = props;
  const { lang, env } = useContext(AppContext);
  const environment = env();

  const handleSubmit = (values: PendingFlowsFilterValues) => {
    setQuery({
      ...query,
      page: 0,
      filters: encodeFilters(values, PENDING_FLOWS_FILTER_INITIAL_VALUES),
    });
  };
  const handleResetForm = (
    formikResetForm: (
      nextState?: Partial<FormikState<PendingFlowsFilterValues>>
    ) => void
  ) => {
    formikResetForm();

    //  We need to delay this action in a synchronous way to avoid
    //  calling 2 setState() actions in an uncontrolled way that could
    //  mess with internal React's component update cycle
    setTimeout(() => {
      setQuery({
        ...query,
        page: 0,
        filters: encodeFilters({}, PENDING_FLOWS_FILTER_INITIAL_VALUES),
      });
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
              <C.AutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.pendingFlowsFilter.filters.status
                )}
                name="status"
                options={[
                  { displayLabel: 'New', value: 'new' },
                  { displayLabel: 'Update', value: 'updated' },
                ]}
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.pendingFlowsFilter.filters.dataProvider
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
                isAutocompleteAPI={false}
              />
              <C.NumberField
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
                fnPromise={(query) => fnOrganizations(query, environment)}
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.pendingFlowsFilter.filters.sourceLocations
                )}
                name="sourceLocations"
                fnPromise={(query) => fnLocations(query, environment)}
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
                fnPromise={(query) => fnOrganizations(query, environment)}
                isMulti
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) =>
                    s.components.pendingFlowsFilter.filters.destinationLocations
                )}
                name="destinationLocations"
                fnPromise={(query) => fnLocations(query, environment)}
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
                fnPromise={() => fnUsageYears(environment)}
                firstViewCondition={usageYearFirstViewCondition}
                isAutocompleteAPI={false}
                isMulti
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
