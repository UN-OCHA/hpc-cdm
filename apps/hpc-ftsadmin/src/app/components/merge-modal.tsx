import EastIcon from '@mui/icons-material/East';
import { Box, Modal } from '@mui/material';
import { errors, util } from '@unocha/hpc-data';
import { C, styled } from '@unocha/hpc-ui';
import { Form, Formik } from 'formik';
import * as io from 'io-ts';
import React from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../i18n';
import { getContext, getEnv } from '../context';
import paths from '../paths';
import { TOAST_CONFIG, TOAST_CONFIG_ERROR } from '../utils/constants';
import { fnCategories, fnOrganizations } from '../utils/fn-promises';
import validateForm from '../utils/form-validation';
import { valueToInteger } from '../utils/map-functions';

type MergeModalProps = {
  type: 'organization' | 'keyword';
  load: () => void;
};
type OrganizationMergeModalValues = {
  mergingEntities: util.FormObjectValue[];
  receivingEntity: util.FormObjectValue | null;
};
type KeywordMergeModalValues = {
  mergingEntities: util.FormObjectValue | null;
  receivingEntity: util.FormObjectValue | null;
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

const MergeContainer = tw.div`
  p-6
  rounded-sm
  border-unocha-panel-border
  border-solid
  basis-1/2
  grow-0
  max-w-[50%]
`;

const StyledForm = tw(Form)`
  w-full
`;

const StyledDiv = tw.div`
  self-center
`;

const EndIcon = styled(EastIcon)`
  [dir='rtl'] & {
    transform: rotate(180deg);
  }
`;

const isKeywordValues = (
  values: OrganizationMergeModalValues | KeywordMergeModalValues
): values is KeywordMergeModalValues => !Array.isArray(values.mergingEntities);
const isOrganizationValues = (
  values: OrganizationMergeModalValues | KeywordMergeModalValues
): values is OrganizationMergeModalValues =>
  Array.isArray(values.mergingEntities);

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
  mergingEntities: util.FormObjectValue[] | (util.FormObjectValue | null);
  receivingEntity: util.FormObjectValue | null;
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
  const { type, load } = props;
  const navigate = useNavigate();

  const ORGANIZATION_INITIAL_VALUES: OrganizationMergeModalValues = {
    mergingEntities: [],
    receivingEntity: null,
  };
  const KEYWORD_INITIAL_VALUES: KeywordMergeModalValues = {
    mergingEntities: null,
    receivingEntity: null,
  };

  const env = getEnv();
  const lang = getContext().lang;

  const ORGANIZATION_FORM_VALIDATION = io.type({
    mergingEntities: util.NON_EMPTY_ARRAY,
    receivingEntity: util.NON_NULL_VALUE,
  });
  const KEYWORD_FORM_VALIDATION = io.type({
    mergingEntities: util.NON_NULL_VALUE,
    receivingEntity: util.NON_NULL_VALUE,
  });

  const VALIDATION_ERROR_MESSAGES: Record<
    keyof io.TypeOf<typeof ORGANIZATION_FORM_VALIDATION>,
    string
  > = {
    mergingEntities: t.t(
      lang,
      (s) => s.components.mergeModal.formError.mergingEntity
    ),
    receivingEntity: t.t(
      lang,
      (s) => s.components.mergeModal.formError.receivingEntity
    ),
  };

  const isOrganizationType = type === 'organization';

  const [isOpen, setIsOpen] = React.useState(false);
  const [isFirstStep, setIsFirstStep] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmValues, setConfirmValues] = React.useState(
    isOrganizationType ? ORGANIZATION_INITIAL_VALUES : KEYWORD_INITIAL_VALUES
  );

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
      setIsLoading(true);
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
          navigate(paths.organization(receivingOrganizationID), {
            state: {
              successMessage: t.t(
                lang,
                (s) => s.components.mergeModal.success.merge,
                {
                  entities: 'organizations',
                }
              ),
            },
          });
        })
        .catch((error) => {
          toast.error(
            parseEntityString(
              t.t(
                lang,
                (s) =>
                  s.components.mergeModal.error[
                    errors.isConflictError(error) ? 'conflict' : 'unknown'
                  ]
              ),
              type,
              lang
            ),
            TOAST_CONFIG_ERROR
          );
        })
        .finally(() => setIsLoading(false));
    } else {
      if (!isKeywordValues(values)) {
        return;
      }
      if (!values.mergingEntities) {
        return;
      }
      setIsLoading(true);
      await env.model.categories
        .mergeKeywords({
          mergingKeywordID: valueToInteger(values.mergingEntities.value),
          receivingKeywordID: valueToInteger(values.receivingEntity.value),
        })
        .then(() => {
          load();
          toast.success(
            t.t(lang, (s) => s.components.mergeModal.success.merge, {
              entities: 'keywords',
            }),
            TOAST_CONFIG
          );
        })
        .catch((error) => {
          toast.error(
            parseEntityString(
              t.t(
                lang,
                (s) =>
                  s.components.mergeModal.error[
                    errors.isConflictError(error) ? 'conflict' : 'unknown'
                  ]
              ),
              type,
              lang
            ),
            TOAST_CONFIG_ERROR
          );
        })
        .finally(() => setIsLoading(false));
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
          onClick={() => setIsOpen(true)}
        />
      </StyledDiv>
      <Modal
        open={isOpen}
        keepMounted={false}
        onClose={() => setIsOpen(!isOpen)}
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
                  : KEYWORD_FORM_VALIDATION,
                VALIDATION_ERROR_MESSAGES
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
                    <MergeContainer>
                      <C.AsyncAutocompleteSelect
                        fnPromise={
                          isOrganizationType
                            ? (query) => fnOrganizations(query, env)
                            : (_) => fnCategories('keywords', env)
                        }
                        name="mergingEntities"
                        label={parseEntityString(
                          t.t(
                            lang,
                            (s) => s.components.mergeModal.mergingEntity
                          ),
                          type,
                          lang
                        )}
                        isMulti={isOrganizationType}
                        removeOptions={
                          values.receivingEntity
                            ? [values.receivingEntity]
                            : undefined
                        }
                        isAutocompleteAPI={isOrganizationType}
                        required
                      />
                    </MergeContainer>
                    <EndIcon />
                    <MergeContainer>
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
                        isAutocompleteAPI={isOrganizationType}
                        removeOptions={
                          isOrganizationValues(values)
                            ? values.mergingEntities
                            : values.mergingEntities !== null
                            ? [values.mergingEntities]
                            : undefined
                        }
                        required
                      />
                    </MergeContainer>
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
                      shouldDisplayLoading={isLoading}
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
