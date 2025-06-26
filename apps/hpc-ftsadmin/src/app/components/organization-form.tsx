import { Form, Formik, type FormikHelpers } from 'formik';
import tw from 'twin.macro';

import DeleteIcon from '@mui/icons-material/Delete';
import {
  errors,
  util,
  type categories,
  type organizations,
} from '@unocha/hpc-data';
import { C } from '@unocha/hpc-ui';
import * as io from 'io-ts';
import { useContext } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { t } from '../../i18n';
import { AppContext } from '../context';
import { fnOrganizationType } from '../pages/organizations/organization';
import paths from '../paths';
import { TOAST_CONFIG, TOAST_CONFIG_ERROR } from '../utils/constants';
import { fnLocations, fnOrganizations } from '../utils/fn-promises';
import validateForm from '../utils/form-validation';
import { valueToInteger } from '../utils/map-functions';
import { isFormObjectValue } from '../utils/parse-flow-form';
interface Props {
  organizationLevels: categories.GetCategoriesResult;
  organizationTypes: categories.GetCategoriesResult;
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
  isActive?: boolean;
  isVerified?: boolean;
  notes?: string; // "notes" makes reference what in the UI it's called "Comments"
  organizationSubType: util.FormObjectValue | null;
  organizationLevel?: util.FormObjectValue | null; // Number[] we need array of IDs
  parent?: util.FormObjectValue | null;
  isCollectiveInd?: boolean;
  comments?: string; // "comments" makes reference what in the UI it's called "Organization Description"
}
export const ADD_EDIT_ORGANIZATION_INITIAL_VALUES: AddEditOrganizationValues = {
  name: '',
  abbreviation: '',
  nativeName: '',
  locations: [], // Number[] we need array of IDs
  url: '',
  isActive: true,
  isVerified: true,
  notes: '', // "notes" makes reference what in the UI it's called "Comments"
  organizationSubType: null,
  organizationLevel: null, // Number[] we need array of IDs
  parent: null,
  isCollectiveInd: false,
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

const parseFormValues = (
  values: AddEditOrganizationValues,
  organizationTypes: categories.GetCategoriesResult
) => {
  const locations = values.locations
    ?.flatMap((loc) => [
      valueToInteger(loc.value),
      loc.parent?.value ? valueToInteger(loc.parent.value) : undefined,
    ])
    .filter((locID) => locID !== undefined);

  const parsedLocations = locations?.length
    ? [...new Set(locations)]
    : undefined;

  let categories: number[] = [];
  const organizationSubType = values.organizationSubType?.value;
  if (organizationSubType) {
    const organizationTypeID = organizationTypes.find(
      (orgType) => orgType.id === valueToInteger(organizationSubType)
    )?.parentID;

    if (organizationTypeID) {
      categories = [organizationTypeID, valueToInteger(organizationSubType)];
    }
  }

  const parentID = values.parent?.value
    ? valueToInteger(values.parent.value)
    : undefined;

  return {
    categories,
    parentID,
    locations: parsedLocations,
    verified: values.isVerified,
    active: values.isActive,
    collectiveInd: values.isCollectiveInd,
  };
};
const formToUpdate = (
  values: AddEditOrganizationValues,
  id: number,
  organizationTypes: categories.GetCategoriesResult
): organizations.UpdateOrganizationParams => {
  const res: organizations.UpdateOrganizationParams = {
    id,
    ...values,
    ...parseFormValues(values, organizationTypes),
  };
  return res;
};

const formToCreate = (
  values: AddEditOrganizationValues,
  organizationTypes: categories.GetCategoriesResult
): organizations.CreateOrganizationParams => {
  const res: organizations.CreateOrganizationParams = {
    organization: {
      ...values,
      ...parseFormValues(values, organizationTypes),
    },
  };
  return res;
};

export const OrganizationForm = ({
  organizationLevels,
  organizationTypes,
  initialValues,
  id,
  load,
}: Props) => {
  const { lang, env } = useContext(AppContext);
  const environment = env();
  const navigate = useNavigate();
  const type: 'update' | 'create' = id ? 'update' : 'create';

  const FORM_VALIDATION = io.type({
    name: util.NON_EMPTY_STRING,
    abbreviation: util.NON_EMPTY_STRING,
    organizationSubType: util.NON_NULL_VALUE,
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
    organizationSubType: t.t(
      lang,
      (s) => s.components.organizationUpdateCreate.formErrors.organizationType
    ),
  };

  const handleChangeOrganizationType = ({
    setFieldValue,
    newValue,
  }: {
    setFieldValue: FormikHelpers<AddEditOrganizationValues>['setFieldValue'];
    newValue: util.FormObjectValue | util.FormObjectValue[] | null;
  }) => {
    setFieldValue('organizationSubType', newValue);

    if (!newValue || !isFormObjectValue(newValue)) {
      setFieldValue('organizationLevel', null);
      return;
    }

    const organizationType = organizationTypes.find(
      (orgType) => orgType.id === valueToInteger(newValue.value)
    );
    const organizationLevelChild = organizationLevels.find(
      (orgLevel) => orgLevel.name === organizationType?.name
    );
    const organizationLevel = organizationLevels.find(
      (orgLevel) => orgLevel.id === organizationLevelChild?.parentID
    );
    if (!organizationLevel) {
      setFieldValue('organizationLevel', null);
      return;
    }

    setFieldValue('organizationLevel', {
      displayLabel: organizationLevel.name,
      value: organizationLevel.id,
    } satisfies util.FormObjectValue);
  };

  const errorHandling = (err: Error) => {
    toast.dismiss();
    if (errors.isDuplicateError(err)) {
      toast.error(
        t.t(
          lang,
          (s) => s.components.organizationUpdateCreate.errors[err.code],
          { organizationName: err.value }
        ),
        TOAST_CONFIG_ERROR
      );
    } else if (errors.isConflictError(err)) {
      toast.error(
        t.t(
          lang,
          (s) => s.components.organizationUpdateCreate.errors[err.code]
        ),
        TOAST_CONFIG_ERROR
      );
    } else {
      toast.error(
        t.t(lang, (s) => s.components.organizationUpdateCreate.errors.unknown),
        TOAST_CONFIG_ERROR
      );
    }
  };

  const deleteErrorHandling = (err: Error) => {
    toast.dismiss();
    toast.error(err.message, TOAST_CONFIG_ERROR);
  };

  const handleSubmit = async (values: AddEditOrganizationValues) => {
    toast.dismiss();
    if (id && load) {
      await environment.model.organizations
        .updateOrganization(formToUpdate(values, id, organizationTypes))
        .then(() => {
          load();
          toast.success(
            t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.success.update,
              { organizationName: values.name }
            ),
            TOAST_CONFIG
          );
        })
        .catch((error) => errorHandling(error));
    } else {
      await environment.model.organizations
        .createOrganization(formToCreate(values, organizationTypes))
        .then((org) => {
          navigate(paths.organization(org.id), {
            state: {
              successMessage: t.t(
                lang,
                (s) => s.components.organizationUpdateCreate.success.create,
                { organizationName: values.name }
              ),
            },
          });
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
      {({ initialValues, setFieldValue }) => (
        <Form>
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
            fnPromise={(query) => fnLocations(query, environment, true)}
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
            name="isActive"
          />

          <C.Switch
            label={t.t(
              lang,
              (s) => s.components.organizationUpdateCreate.fields.verified
            )}
            name="isVerified"
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

          <C.AutocompleteSelect
            label={t.t(
              lang,
              (s) =>
                s.components.organizationUpdateCreate.fields.organizationTypes
            )}
            name="organizationSubType"
            options={fnOrganizationType(organizationTypes)}
            onChange={(newValue) =>
              handleChangeOrganizationType({ setFieldValue, newValue })
            }
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
            name="isCollectiveInd"
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
                redirectAfterFetch={{
                  to: paths.organizations(),
                  options: {
                    state: {
                      successMessage: t.t(
                        lang,
                        (s) =>
                          s.components.organizationUpdateCreate.success.delete,
                        { organizationName: initialValues.name }
                      ),
                    },
                  },
                }}
                handlerErrorToast={deleteErrorHandling}
              />
            )}
            <AlignButton>
              <C.ButtonSubmit
                color="primary"
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
