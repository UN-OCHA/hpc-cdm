import { Box, Modal } from '@mui/material';
import { C } from '@unocha/hpc-ui';
import tw from 'twin.macro';
import { fnCategories, fnOrganizations } from '../utils/fn-promises';
import { getContext, getEnv } from '../context';
import EastIcon from '@mui/icons-material/East';
import React from 'react';
import { Form, Formik } from 'formik';
import * as paths from '../paths';
import * as io from 'io-ts';
import { FormObjectValue, util as codecs, errors } from '@unocha/hpc-data';
import validateForm from '../utils/form-validation';
import { valueToInteger } from '../utils/map-functions';
import { useNavigate } from 'react-router-dom';
import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';

type MergeModalProps = {
  type: 'organization' | 'keyword';
};
type OrganizationMergeModalValues = {
  mergingEntities: Array<FormObjectValue>;
  receivingEntity: FormObjectValue | null;
};
type KeywordMergeModalValues = {
  mergingEntities: FormObjectValue | null;
  receivingEntity: FormObjectValue | null;
};

const ModalContainer = tw.div`
  p-8
  my-1 
  flex 
  justify-between 
  items-center
  bg-white
  shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]
  w-[60vw]
  rounded-sm
`;

const StyledForm = tw(Form)`
  w-full
`;

const StyledDiv = tw.div`
  self-center
`;

const isKeywordValues = (
  values: OrganizationMergeModalValues | KeywordMergeModalValues
): values is KeywordMergeModalValues => !Array.isArray(values.mergingEntities);
const isOrganizationValues = (
  values: OrganizationMergeModalValues | KeywordMergeModalValues
): values is OrganizationMergeModalValues =>
  Array.isArray(values.mergingEntities);

const reloadPage = () => window.location.reload();
const parseEntityString = (
  value: string,
  type: 'organization' | 'keyword',
  lang: LanguageKey
) => {
  const singular = t.t(lang, (s) => s.components.mergeModal[type].singular);
  const plural = t.t(lang, (s) => s.components.mergeModal[type].plural);
  return value.replace('{entity}', singular).replace('{entities}', plural);
};
const ConfirmationText = ({
  mergingEntities,
  receivingEntity,
  lang,
}: {
  mergingEntities: Array<FormObjectValue> | (FormObjectValue | null);
  receivingEntity: FormObjectValue | null;
  lang: LanguageKey;
}) => {
  if (!receivingEntity) {
    return;
  }
  let text = t
    .t(lang, (s) => s.components.mergeModal.confirmationMessage)
    .replace('{receivingEntity}', receivingEntity.displayLabel);

  if (Array.isArray(mergingEntities)) {
    text = text.replace(
      '{mergingEntities}',
      mergingEntities.map((x) => x.displayLabel).toString()
    );
  } else {
    if (!mergingEntities) {
      return;
    }
    text = text.replace('{mergingEntities}', mergingEntities.displayLabel);
  }

  return <p>{text}</p>;
};
const MergeModal = (props: MergeModalProps) => {
  const { type } = props;
  const navigate = useNavigate();

  const ORGANIZATION_INITIAL_VALUES: OrganizationMergeModalValues = {
    mergingEntities: [],
    receivingEntity: null,
  };
  const KEYWORD_INITIAL_VALUES: KeywordMergeModalValues = {
    mergingEntities: null,
    receivingEntity: null,
  };
  const ORGANIZATION_FORM_VALIDATION = io.type({
    mergingEntities: codecs.NON_EMPTY_ARRAY,
    receivingEntity: codecs.NON_NULL_VALUE,
  });
  const KEYWORD_FORM_VALIDATION = io.type({
    mergingEntities: codecs.NON_NULL_VALUE,
    receivingEntity: codecs.NON_NULL_VALUE,
  });

  const env = getEnv();
  const lang = getContext().lang;

  const isOrganizationType = type === 'organization';

  const [open, setOpen] = React.useState(false);
  const [isFirstStep, setIsFirstStep] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [confirmValues, setConfirmValues] = React.useState(
    isOrganizationType ? ORGANIZATION_INITIAL_VALUES : KEYWORD_INITIAL_VALUES
  );
  const [error, setError] =
    React.useState<keyof Strings['components']['mergeModal']['error']>();

  const confirmStep = (
    values: OrganizationMergeModalValues | KeywordMergeModalValues
  ) => {
    setIsFirstStep(false);
    setConfirmValues(values);
  };

  const mergeEntities = async (
    values: OrganizationMergeModalValues | KeywordMergeModalValues
  ) => {
    if (!values.receivingEntity) {
      return;
    }
    if (isOrganizationType && isOrganizationValues(values)) {
      const receivingOrganizationID = valueToInteger(
        values.receivingEntity.value
      );
      setLoading(true);
      await env.model.organizations
        .mergeOrganizations({
          fromOrganizationIds: {
            organizationId: receivingOrganizationID,
            organizationsToBeMerged: values.mergingEntities.map((x) => {
              return { id: valueToInteger(x.value) };
            }),
          },
        })
        .then(() => {
          setLoading(false);
          navigate(paths.organization(receivingOrganizationID));
        })
        .catch((err) => {
          setLoading(false);
          if (errors.isConflictError(err)) {
            setError('conflict');
          } else {
            setError('unknown');
          }
        });
    } else {
      if (!isKeywordValues(values)) {
        return;
      }
      if (!values.mergingEntities) {
        return;
      }
      setLoading(true);
      await env.model.categories
        .mergeKeywords({
          mergingKeywordID: valueToInteger(values.mergingEntities.value),
          receivingKeywordID: valueToInteger(values.receivingEntity.value),
        })
        .then(() => {
          setLoading(false);
          reloadPage();
        })
        .catch((err) => {
          setLoading(false);
          if (errors.isConflictError(err)) {
            setError('conflict');
          } else {
            setError('unknown');
          }
        });
    }
  };
  return (
    <>
      <StyledDiv>
        <C.Button
          text={parseEntityString(
            t.t(lang, (s) => s.components.mergeModal.description),
            type,
            lang
          )}
          color="neutral"
          onClick={() => setOpen(true)}
        />
      </StyledDiv>
      <Modal
        open={open}
        keepMounted={false}
        onClose={() => setOpen(!open)}
        sx={tw`flex items-center justify-center`}
      >
        <ModalContainer>
          <Formik
            initialValues={
              isOrganizationType
                ? ORGANIZATION_INITIAL_VALUES
                : KEYWORD_INITIAL_VALUES
            }
            onSubmit={confirmStep}
            validate={(values) =>
              validateForm(
                values,
                isOrganizationType
                  ? ORGANIZATION_FORM_VALIDATION
                  : KEYWORD_FORM_VALIDATION
              )
            }
          >
            {({ values }) => (
              <StyledForm>
                <Box sx={isFirstStep ? tw`w-full` : tw`hidden`}>
                  <h2>
                    {parseEntityString(
                      t.t(lang, (s) => s.components.mergeModal.description),
                      type,
                      lang
                    )}
                  </h2>
                  <Box sx={tw`flex items-center gap-x-4`}>
                    <C.AsyncAutocompleteSelect
                      fnPromise={
                        isOrganizationType
                          ? (query) => fnOrganizations(query, env)
                          : (_) => fnCategories('keywords', env)
                      }
                      name="mergingEntities"
                      label={parseEntityString(
                        t.t(lang, (s) => s.components.mergeModal.mergingEntity),
                        type,
                        lang
                      )}
                      isMulti={isOrganizationType}
                      removeOptions={
                        values.receivingEntity
                          ? [values.receivingEntity]
                          : undefined
                      }
                      required
                      error={(_) =>
                        t.t(
                          lang,
                          (s) => s.components.mergeModal.formError.mergingEntity
                        )
                      }
                    />
                    <EastIcon /> {/** TODO: Support rtl languages */}
                    <C.AsyncAutocompleteSelect
                      fnPromise={
                        isOrganizationType
                          ? (query) => fnOrganizations(query, env)
                          : (_) => fnCategories('keywords', env)
                      }
                      name="receivingEntity"
                      label={parseEntityString(
                        t.t(
                          lang,
                          (s) => s.components.mergeModal.receivingEntity
                        ),
                        type,
                        lang
                      )}
                      required
                      error={(_) =>
                        t.t(
                          lang,
                          (s) =>
                            s.components.mergeModal.formError.receivingEntity
                        )
                      }
                      removeOptions={
                        isOrganizationValues(values)
                          ? values.mergingEntities
                          : values.mergingEntities !== null
                          ? [values.mergingEntities]
                          : undefined
                      }
                    />
                  </Box>
                  <Box sx={tw`text-end mt-4`}>
                    <C.ButtonSubmit
                      color="primary"
                      text={t.t(
                        lang,
                        (s) => s.components.mergeModal.button.next
                      )}
                    />
                  </Box>
                </Box>

                <Box sx={!isFirstStep ? tw`w-full` : tw`hidden`}>
                  <C.ErrorAlert
                    setError={setError}
                    error={
                      error
                        ? parseEntityString(
                            t.t(
                              lang,
                              (s) => s.components.mergeModal.error[error]
                            ),
                            type,
                            lang
                          )
                        : undefined
                    }
                  />
                  <ConfirmationText lang={lang} {...confirmValues} />
                  <Box sx={tw`flex justify-end gap-x-4`}>
                    <C.Button
                      color="secondary"
                      text={t.t(
                        lang,
                        (s) => s.components.mergeModal.button.cancel
                      )}
                      onClick={() => setIsFirstStep(true)}
                    />
                    <C.Button
                      color="primary"
                      text={t.t(
                        lang,
                        (s) => s.components.mergeModal.button.yes
                      )}
                      onClick={() => mergeEntities(confirmValues)}
                      displayLoading={loading}
                    />
                  </Box>
                </Box>
              </StyledForm>
            )}
          </Formik>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default MergeModal;
