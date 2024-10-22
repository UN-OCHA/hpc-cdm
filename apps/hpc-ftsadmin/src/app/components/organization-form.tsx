import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import DeleteIcon from '@mui/icons-material/Delete';
import { errors, util, type organizations } from '@unocha/hpc-data';
import { C } from '@unocha/hpc-ui';
import * as io from 'io-ts';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import { t } from '../../i18n';
import { type Strings } from '../../i18n/iface';
import { AppContext } from '../context';
import * as paths from '../paths';
import {
  fnCategories,
  fnLocations,
  fnOrganizations,
} from '../utils/fn-promises';
import validateForm from '../utils/form-validation';
import { parseError, valueToInteger } from '../utils/map-functions';
interface Props {
  id?: number;
  load?: () => void;
  initialValues?: AddEditOrganizationValues;
}
/**
 * The key names for the form correspond to the ones
 * we pass to the API endpoint v1/organization/create
 */
export interface AddEditOrganizationValues {
  name: string;
  abbreviation: string;
  nativeName?: string;
  locations?: util.FormObjectValue[]; // Number[] we need array of IDs
  url?: string;
  active?: boolean;
  verified?: boolean;
  notes?: string; // "notes" makes reference what in the UI it's called "Comments" (Not my decision)
  organizationTypes: util.FormObjectValue[];
  organizationLevel?: util.FormObjectValue; // Number[] we need array of IDs
  parent?: util.FormObjectValue;
  collectiveInd?: boolean;
  comments?: string; // "comments" makes reference what in the UI it's called "Organization Description" (Not my decision)
}
export const ADD_EDIT_ORGANIZATION_INITIAL_VALUES: AddEditOrganizationValues = {
  name: '',
  abbreviation: '',
  nativeName: '',
  locations: [], // Number[] we need array of IDs
  url: '',
  active: true,
  verified: true,
  notes: '', // "notes" makes reference what in the UI it's called "Comments" (Not my decision)
  organizationTypes: [],
  organizationLevel: { displayLabel: '', value: '' }, // Number[] we need array of IDs
  parent: { displayLabel: '', value: '' },
  collectiveInd: false,
  comments: '',
};
const StyledDiv = tw.div`
  my-6
  me-4
  lg:flex
  justify-end
  gap-x-4
`;
const AlignButton = tw.div`
  self-center
`;

const InfoText = tw.p`
  mb-0
  mt-6
  italic
  text-unocha-textLight
`;

const parseFormValues = (values: AddEditOrganizationValues) => {
  const locations: number[] = [];
  if (values.locations) {
    for (const loc of values.locations) {
      locations.push(valueToInteger(loc.value));
      if (loc.parent) {
        locations.push(valueToInteger(loc.parent.value));
      }
    }
  }
  const parsedLocations =
    locations.length > 0 ? [...new Set(locations)] : undefined;
  const categories = values.organizationTypes.map((org) =>
    valueToInteger(org.value)
  );
  const parentID = values.parent?.value
    ? valueToInteger(values.parent.value)
    : undefined;

  return { categories, parentID, locations: parsedLocations };
};
const formToUpdate = (
  values: AddEditOrganizationValues,
  id: number
): organizations.UpdateOrganizationParams => {
  const res: organizations.UpdateOrganizationParams = {
    ...values,
    id,
    ...parseFormValues(values),
  };
  return res;
};

const formToCreate = (
  values: AddEditOrganizationValues
): organizations.CreateOrganizationParams => {
  const res: organizations.CreateOrganizationParams = {
    organization: {
      ...values,
      ...parseFormValues(values),
    },
  };
  return res;
};

export const OrganizationForm = ({ initialValues, id, load }: Props) => {
  const { lang, env } = useContext(AppContext);
  const environment = env();
  const navigate = useNavigate();
  const type: 'update' | 'create' = id ? 'update' : 'create';
  const [formError, setFormError] =
    useState<
      keyof Strings['components']['organizationUpdateCreate']['errors']
    >();
  const [errorValue, setErrorValue] = useState('');

  const FORM_VALIDATION = io.type({
    name: util.NON_EMPTY_STRING,
    abbreviation: util.NON_EMPTY_STRING,
    organizationTypes: util.NON_EMPTY_ARRAY,
  });

  const VALIDATION_ERROR_MESSAGES: Record<
    keyof io.TypeOf<typeof FORM_VALIDATION>,
    string
  > = {
    name: t.t(
      lang,
      (s) => s.components.organizationUpdateCreate.formErrors.name
    ),
    abbreviation: t.t(
      lang,
      (s) => s.components.organizationUpdateCreate.formErrors.abbreviation
    ),
    organizationTypes: t.t(
      lang,
      (s) => s.components.organizationUpdateCreate.formErrors.organizationType
    ),
  };

  const errorHandling = (err: Error) => {
    if (errors.isDuplicateError(err)) {
      setErrorValue(err.value);
      setFormError(err.code);
    } else if (errors.isConflictError(err)) {
      setFormError(err.code);
    } else {
      setFormError('unknown');
    }
  };

  const handleSubmit = async (values: AddEditOrganizationValues) => {
    if (id && load) {
      await environment.model.organizations
        .updateOrganization(formToUpdate(values, id))
        .finally(load)
        .catch((error) => errorHandling(error));
    } else {
      await environment.model.organizations
        .createOrganization(formToCreate(values))
        .then((org) => {
          navigate(paths.organization(org.id));
        })
        .catch((error) => errorHandling(error));
    }
  };
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues ?? ADD_EDIT_ORGANIZATION_INITIAL_VALUES}
      onSubmit={handleSubmit}
      validate={(values) =>
        validateForm(values, FORM_VALIDATION, VALIDATION_ERROR_MESSAGES)
      }
    >
      {({ initialValues }) => (
        <Form>
          <C.MessageAlert
            setMessage={setFormError}
            message={parseError(
              formError,
              'organizationUpdateCreate',
              lang,
              errorValue
            )}
            severity="error"
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.name
            )}
            name="name"
            required
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.abbreviation
            )}
            name="abbreviation"
            required
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.nativeName
            )}
            name="nativeName"
          />

          <C.Divider />

          <C.AsyncAutocompleteSelect
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.locations
            )}
            name="locations"
            fnPromise={(query) => fnLocations(query, environment)}
            isMulti
            allowChildrenRender
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.url
            )}
            name="url"
          />

          <C.Switch
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.active
            )}
            name="active"
          />

          <C.Switch
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.verified
            )}
            name="verified"
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.notes
            )}
            name="notes"
            textarea
          />

          <C.Divider />

          <C.AsyncAutocompleteSelect
            label={t.t(
              lang,
              (s) =>
                s.components.organizationUpdateCreate.fields.organizationTypes
            )}
            name="organizationTypes"
            fnPromise={() => fnCategories('organizationType', environment)}
            isAutocompleteAPI={false}
            isMulti
            required
          />
          <InfoText>
            {t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.text.organizationType
            )}
          </InfoText>
          <C.AutocompleteSelect
            label={t.t(
              lang,
              (s) =>
                s.components.organizationUpdateCreate.fields.organizationLevel
            )}
            name="organizationLevel"
            options={
              initialValues.organizationLevel
                ? [initialValues.organizationLevel]
                : []
            }
            readOnly
          />

          <C.Divider />

          <C.AsyncAutocompleteSelect
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.parent
            )}
            name="parent"
            fnPromise={(query) => fnOrganizations(query, environment)}
            isAutocompleteAPI
          />
          <InfoText>
            {t.t(
              lang,
              (s) =>
                s.components.organizationUpdateCreate.text
                  .collectiveOrganization
            )}
          </InfoText>
          <C.CheckBox
            name="collectiveInd"
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.collectiveInd
            )}
            size="small"
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.comments
            )}
            name="comments"
            textarea
          />
          <C.Divider />
          <StyledDiv>
            {id && (
              <C.AsyncIconButton
                fnPromise={() =>
                  environment.model.organizations.deleteOrganization({ id })
                }
                IconComponent={DeleteIcon}
                confirmModal={t.get(
                  lang,
                  (s) => s.components.organizationUpdateCreate.modal
                )}
                redirectAfterFetch={paths.organizations()}
              />
            )}
            <AlignButton>
              <C.ButtonSubmit
                color={formError ? 'secondary' : 'primary'}
                text={t.t(
                  lang,
                  (s) => s.components.organizationUpdateCreate[type]
                )}
              />
            </AlignButton>
          </StyledDiv>
        </Form>
      )}
    </Formik>
  );
};
export default OrganizationForm;
