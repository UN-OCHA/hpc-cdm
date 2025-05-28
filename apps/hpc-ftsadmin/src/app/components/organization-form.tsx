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
import validateForm, { parseFieldError } from '../utils/form-validation';
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
const formToUpdate = (
  values: AddEditOrganizationValues,
  id: number
): organizations.UpdateOrganizationParams => {
  const res: organizations.UpdateOrganizationParams = {
    ...values,
    id,
    categories: values.organizationTypes.map((org) =>
      valueToInteger(org.value)
    ),
    parentID: values.parent?.value
      ? valueToInteger(values.parent.value)
      : undefined,
    locations: values.locations?.map((loc) => valueToInteger(loc.value)),
  };
  return res;
};

const formToCreate = (
  values: AddEditOrganizationValues
): organizations.CreateOrganizationParams => {
  const res: organizations.CreateOrganizationParams = {
    organization: {
      ...values,
      categories: values.organizationTypes.map((org) =>
        valueToInteger(org.value)
      ),
      parentID: values.parent?.value
        ? valueToInteger(values.parent.value)
        : undefined,
      locations: values.locations?.map((loc) => valueToInteger(loc.value)),
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
  const FORM_VALIDATION = io.partial({
    name: util.NON_EMPTY_STRING,
    abbreviation: util.NON_EMPTY_STRING,
    organizationTypes: util.NON_EMPTY_ARRAY,
  });
  const handleSubmit = async (values: AddEditOrganizationValues) => {
    if (id && load) {
      await environment.model.organizations
        .updateOrganization(formToUpdate(values, id))
        .finally(load)
        .catch((error) => {
          if (errors.isDuplicateError(error)) {
            setErrorValue(error.value);
            setFormError(error.code);
          } else {
            setFormError('unknown');
          }
        });
    } else {
      await environment.model.organizations
        .createOrganization(formToCreate(values))
        .then((org) => {
          navigate(paths.organization(org.id));
        })
        .catch((error) => {
          if (errors.isDuplicateError(error)) {
            setErrorValue(error.value);
            setFormError(error.code);
          } else {
            setFormError('unknown');
          }
        });
    }
  };
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues ?? ADD_EDIT_ORGANIZATION_INITIAL_VALUES}
      onSubmit={handleSubmit}
      validate={(values) => validateForm(values, FORM_VALIDATION)}
    >
      {({ initialValues }) => (
        <Form>
          <C.ErrorAlert
            setError={
              setFormError as React.Dispatch<
                React.SetStateAction<string | undefined>
              >
            }
            error={parseError(
              formError,
              'organizationUpdateCreate',
              lang,
              errorValue
            )}
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.name
            )}
            name="name"
            error={(metaError) =>
              parseFieldError(
                metaError,
                t.t(
                  lang,
                  (s) => s.components.organizationUpdateCreate.formErrors.name
                )
              )
            }
            required
          />
          <C.TextFieldWrapper
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.abbreviation
            )}
            name="abbreviation"
            error={(metaError) =>
              parseFieldError(
                metaError,
                t.t(
                  lang,
                  (s) =>
                    s.components.organizationUpdateCreate.formErrors
                      .abbreviation
                )
              )
            }
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
            error={(metaError) =>
              parseFieldError(
                metaError,
                t.t(
                  lang,
                  (s) =>
                    s.components.organizationUpdateCreate.formErrors
                      .organizationType
                )
              )
            }
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
