import { Form, Formik, FormikState } from 'formik';
import tw from 'twin.macro';

import { C } from '@unocha/hpc-ui';
import { Environment } from '../../../environments/interface';
import {
  FormObjectValue,
  decodeFilters,
  encodeFilters,
} from '../../utils/parse-filters';
import { LanguageKey, t } from '../../../i18n';
import { Dayjs } from 'dayjs';
import { Query } from '../tables/table-utils';
import * as io from 'io-ts';
import validateForm from '../../utils/form-validation';
interface Props {
  environment: Environment;
  query: Query;
  setQuery: (newQuery: Query) => void;
  lang: LanguageKey;
}
export interface OrganizationFilterValues {
  organization?: string;
  organizationType?: FormObjectValue | null;
  parentOrganization?: FormObjectValue | null;
  locations?: FormObjectValue | null;
  date?: Dayjs | null;
  status?: string;
}

export const ORGANIZATIONS_FILTER_INITIAL_VALUES: OrganizationFilterValues = {
  organization: '',
  organizationType: null,
  parentOrganization: null,
  locations: null,
  date: null,
  status: '',
};
const StyledDiv = tw.div`
my-6
me-4
lg:flex
justify-end
gap-x-4 
`;
export const FilterOrganizationsTable = (props: Props) => {
  const { environment, setQuery, query, lang } = props;
  const filters = decodeFilters(
    query.filters,
    ORGANIZATIONS_FILTER_INITIAL_VALUES
  );

  const FORM_VALIDATION = io.partial({
    organization: io.string,
  });

  const handleSubmit = (values: OrganizationFilterValues) => {
    setQuery({
      ...query,
      page: 0,
      filters: encodeFilters(values, ORGANIZATIONS_FILTER_INITIAL_VALUES),
    });
  };
  const handleResetForm = (
    formikResetForm: (
      nextState?: Partial<FormikState<OrganizationFilterValues>>
    ) => void
  ) => {
    formikResetForm();
    setQuery({
      ...query,
      page: 0,
      filters: encodeFilters({}, ORGANIZATIONS_FILTER_INITIAL_VALUES),
    });
  };
  return (
    <C.SearchFilter
      title={t.t(lang, (s) => s.components.organizationsFilter.title)}
    >
      <Formik
        enableReinitialize
        initialValues={filters}
        validate={(values) => validateForm(values, FORM_VALIDATION)}
        onSubmit={handleSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <StyledDiv>
              <C.ButtonSubmit
                color="primary"
                text={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.button.primary
                )}
              />
              <C.Button
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.button.secondary
                )}
              />
            </StyledDiv>
            <C.Section
              title={t.t(
                lang,
                (s) =>
                  s.components.organizationsFilter.headers.organizationDetails
              )}
            >
              <C.TextFieldWrapper
                name="organization"
                label={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.filters.organization
                )}
                type="text"
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) =>
                    s.components.organizationsFilter.filters.organizationType
                )}
                name="organizationType"
                fnPromise={environment.model.categories.getCategories}
                category="organizationType"
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) =>
                    s.components.organizationsFilter.filters.parentOrganization
                )}
                name="parentOrganization"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isAutocompleteAPI
              />
              <C.AsyncAutocompleteSelect
                label={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.filters.locations
                )}
                name="locations"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isAutocompleteAPI
              />
              <C.DatePicker
                name="date"
                lang={lang}
                label={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.filters.date
                )}
              />
              <C.SingleSelect
                name="status"
                label={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.filters.status
                )}
                options={[
                  { displayLabel: 'Active', value: 'active' },
                  { displayLabel: 'Inactive', value: 'inactive' },
                  { displayLabel: 'Both', value: 'both' },
                ]}
              />
            </C.Section>
            <StyledDiv>
              <C.ButtonSubmit
                color="primary"
                text={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.button.primary
                )}
              />
              <C.Button
                color="neutral"
                onClick={() => handleResetForm(resetForm)}
                text={t.t(
                  lang,
                  (s) => s.components.organizationsFilter.button.secondary
                )}
              />
            </StyledDiv>
          </Form>
        )}
      </Formik>
    </C.SearchFilter>
  );
};
export default FilterOrganizationsTable;
