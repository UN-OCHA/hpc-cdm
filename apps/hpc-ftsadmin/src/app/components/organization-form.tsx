import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import { C } from '@unocha/hpc-ui';
import { FormObjectValue } from '../utils/parse-filters';
import { t } from '../../i18n';
import { AppContext } from '../context';
import { useContext } from 'react';
import { organizations } from '@unocha/hpc-data';
import { redirect, useNavigate } from 'react-router-dom';
import * as paths from '../paths';

interface Props {
  id?: number;
  load?: () => void;
  initialValues?: AddEditOrganizationValues;
}
/**
 *  The key names for the form correspond to the ones we pass to the API endpoint v1/organization/create
 */
export interface AddEditOrganizationValues {
  name: string;
  abbreviation: string;
  nativeName?: string;
  locations?: Array<FormObjectValue>; //    number[] we need array of IDs
  url?: string;
  active?: boolean;
  verified?: boolean;
  notes?: string; // "notes" makes reference what in the UI it's called "Comments" (Not my decision)
  organizationTypes: Array<FormObjectValue>;
  organizationLevel?: FormObjectValue; //    number[] we need array of IDs
  parent?: FormObjectValue;
  collectiveInd?: boolean;
  comments?: string; // "comments" makes reference what in the UI it's called "Organization Description" (Not my decision)
}
export const ADD_EDIT_ORGANIZATION_INITIAL_VALUES: AddEditOrganizationValues = {
  name: '',
  abbreviation: '',
  nativeName: '',
  locations: [], //    number[] we need array of IDs
  url: '',
  active: true,
  verified: true,
  notes: '', // "notes" makes reference what in the UI it's called "Comments" (Not my decision)
  organizationTypes: [],
  organizationLevel: { displayLabel: '', value: '' }, //    number[] we need array of IDs
  parent: { displayLabel: '', value: '' },
  collectiveInd: false,
  comments: '',
};

const Container = tw.div`
xl:px-40
xl:gap-x-24
md:px-32
md:gap-x-16
px-20
gap-x-10
grid
grid-cols-2
`;
const Column = tw.div`
col-span-1
`;

const StyledDiv = tw.div`
my-6
me-4
lg:flex
justify-end
gap-x-4 
`;

const formToUpdate = (
  values: AddEditOrganizationValues,
  id: number
): organizations.UpdateOrganizationParams => {
  const res: organizations.UpdateOrganizationParams = {
    ...values,
    id: id,
    categories: values.organizationTypes.map((org) => parseInt(org.value)),
    parentID: values.parent?.value ? parseInt(values.parent.value) : undefined,
    locations: values.locations?.map((loc) => parseInt(loc.value)),
  };
  return res;
};

const formToCreate = (
  values: AddEditOrganizationValues
): organizations.CreateOrganizationParams => {
  const res: organizations.CreateOrganizationParams = {
    organization: {
      ...values,
      categories: values.organizationTypes.map((org) => parseInt(org.value)),
      parentID: values.parent?.value
        ? parseInt(values.parent.value)
        : undefined,
      locations: values.locations?.map((loc) => parseInt(loc.value)),
    },
  };
  return res;
};

export const OrganizationForm = ({ initialValues, id, load }: Props) => {
  const { lang, env } = useContext(AppContext);
  const environment = env();
  const navigate = useNavigate();
  const handleSubmit = async (values: AddEditOrganizationValues) => {
    try {
      if (id && load) {
        await environment.model.organizations
          .updateOrganization(formToUpdate(values, id))
          .finally(load);
      } else {
        const org = await environment.model.organizations.createOrganization(
          formToCreate(values)
        );
        navigate(paths.organization(org.id));
      }
    } catch {
      console.error('ERROR WHILE UPDATING ORGANIZATION');
    }
  };
  return (
    <Formik
      enableReinitialize
      initialValues={
        initialValues ? initialValues : ADD_EDIT_ORGANIZATION_INITIAL_VALUES
      }
      onSubmit={handleSubmit}
    >
      {({ initialValues }) => (
        <Form>
          <Container>
            <Column>
              <C.TextFieldWrapper
                label="Organization Name"
                name="name"
                type="text"
              />
              <C.TextFieldWrapper
                label="Organization Abbreviation"
                name="abbreviation"
                type="text"
              />
              <C.TextFieldWrapper
                label="Name in Another Language"
                name="nativeName"
                type="text"
              />

              <C.AsyncAutocompleteSelect
                label="Country(ies)"
                name="locations"
                fnPromise={environment.model.locations.getAutocompleteLocations}
                isMulti
              />
              <C.TextFieldWrapper label="Website URL" name="url" type="text" />

              <C.Switch label="Active" name="active" />

              <C.Switch label="Verified" name="verified" />
            </Column>
            <Column>
              <C.TextFieldWrapper
                label="Comments"
                name="notes"
                type="text"
                textarea
              />
              <C.AsyncAutocompleteSelect
                label="Organization Type"
                name="organizationTypes"
                fnPromise={environment.model.categories.getCategories}
                category="organizationType"
                isMulti
              />
              <C.SingleSelect
                label="Organization Level"
                name="organizationLevel"
                options={[
                  initialValues.organizationLevel
                    ? initialValues.organizationLevel
                    : { displayLabel: '', value: '' },
                ]}
                readonly
              />
              <C.AsyncAutocompleteSelect
                label="Parent Organization"
                name="parent"
                fnPromise={
                  environment.model.organizations.getAutocompleteOrganizations
                }
                isAutocompleteAPI
              />
              <C.CheckBox
                name="collectiveInd"
                label="Collective Organization"
                size="small"
              />
              <C.TextFieldWrapper
                label="Organization Description"
                name="comments"
                type="text"
                textarea
              />

              <StyledDiv>
                <C.ButtonSubmit
                  color="primary"
                  text={t.t(
                    lang,
                    (s) => s.components.flowsFilter.button.primary
                  )}
                />
              </StyledDiv>
            </Column>
          </Container>
        </Form>
      )}
    </Formik>
  );
};
export default OrganizationForm;
