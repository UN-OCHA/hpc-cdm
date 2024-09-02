import { Form, Formik } from 'formik';
import tw from 'twin.macro';

import { C } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import { AppContext } from '../context';
import { useContext, useState } from 'react';
import { organizations, FormObjectValue } from '@unocha/hpc-data';
import { useNavigate } from 'react-router-dom';
import * as paths from '../paths';
import { errors } from '@unocha/hpc-data';
import { Strings } from '../../i18n/iface';
import DeleteIcon from '@mui/icons-material/Delete';
import * as io from 'io-ts';
import { util as codecs } from '@unocha/hpc-data';
import validateForm, { parseFieldError } from '../utils/form-validation';
import {
  fnCategories,
  fnLocations,
  fnOrganizations,
} from '../utils/fn-promises';
import { valueToInteger } from '../utils/map-functions';
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
  locations?: Array<FormObjectValue>; // number[] we need array of IDs
  url?: string;
  active?: boolean;
  verified?: boolean;
  notes?: string; // "notes" makes reference what in the UI it's called "Comments" (Not my decision)
  organizationTypes: Array<FormObjectValue>;
  organizationLevel?: FormObjectValue; // number[] we need array of IDs
  parent?: FormObjectValue;
  collectiveInd?: boolean;
  comments?: string; // "comments" makes reference what in the UI it's called "Organization Description" (Not my decision)
}
export const ADD_EDIT_ORGANIZATION_INITIAL_VALUES: AddEditOrganizationValues = {
  name: '',
  abbreviation: '',
  nativeName: '',
  locations: [], // number[] we need array of IDs
  url: '',
  active: true,
  verified: true,
  notes: '', // "notes" makes reference what in the UI it's called "Comments" (Not my decision)
  organizationTypes: [],
  organizationLevel: { displayLabel: '', value: '' }, // number[] we need array of IDs
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
    id: id,
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
  const [error, setError] =
    useState<
      keyof Strings['components']['organizationUpdateCreate']['errors']
    >();
  const [errorValue, setErrorValue] = useState('');
  const FORM_VALIDATION = io.partial({
    name: codecs.NON_EMPTY_STRING,
    abbreviation: codecs.NON_EMPTY_STRING,
    organizationTypes: codecs.NON_EMPTY_ARRAY,
  });
  const handleSubmit = async (values: AddEditOrganizationValues) => {
    if (id && load) {
      await environment.model.organizations
        .updateOrganization(formToUpdate(values, id))
        .finally(load)
        .catch((err) => {
          if (errors.isDuplicateError(err)) {
            setErrorValue(err.value);
            setError(err.code);
          } else {
            setError('unknown');
          }
        });
    } else {
      await environment.model.organizations
        .createOrganization(formToCreate(values))
        .then((org) => {
          navigate(paths.organization(org.id));
        })
        .catch((err) => {
          if (errors.isDuplicateError(err)) {
            setErrorValue(err.value);
            setError(err.code);
          } else {
            setError('unknown');
          }
        });
    }
  };
  const parseError = (
    error:
      | keyof Strings['components']['organizationUpdateCreate']['errors']
      | undefined
  ): string | undefined => {
    if (!error) {
      return undefined;
    }
    const traducedError = t.t(
      lang,
      (s) => s.components.organizationUpdateCreate.errors[error]
    );
    if (error === 'duplicate') {
      return traducedError.replace('{organizationName}', errorValue);
    }
    return traducedError;
  };
  return (
    <Formik
      enableReinitialize
      initialValues={
        initialValues ? initialValues : ADD_EDIT_ORGANIZATION_INITIAL_VALUES
      }
      onSubmit={handleSubmit}
      validate={(values) => validateForm(values, FORM_VALIDATION)}
    >
      {({ initialValues }) => (
        <Form>
          <C.ErrorAlert
            setError={
              setError as React.Dispatch<
                React.SetStateAction<string | undefined>
              >
            }
            error={parseError(error)}
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
                color={error ? 'secondary' : 'primary'}
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
