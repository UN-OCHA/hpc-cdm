import { getContext } from '../../context';
import * as io from 'io-ts';
import {
  type FormObjectValue,
  util as codecs,
  flows,
  categories,
  errors,
  usageYears,
  locations,
  governingEntities,
} from '@unocha/hpc-data';
import { Form, Formik, FormikHelpers } from 'formik';
import {
  RefDirection,
  parseFlowForm,
  pendingValuesFlowForm,
  queryParamsFlowFilter,
  serializeFlowForm,
} from '../../utils/parse-flow-form';
import { Box, Grow, Paper, Snackbar, SxProps, Theme } from '@mui/material';
import tw from 'twin.macro';
import AsyncAutocompleteSelectReview from './inputs/async-autocomplete-pending-review';
import {
  fnCategories,
  fnCurrencies,
  fnEmergencies,
  fnFlowStatusId,
  fnGlobalClusters,
  fnGoverningEntities,
  fnLocations,
  fnOrganizations,
  fnPlans,
  fnProjects,
  fnUsageYears,
} from '../../utils/fn-promises';
import { C } from '@unocha/hpc-ui';
import NumberFieldReview from './inputs/number-field-pending-review';
import TextFieldReview from './inputs/text-field-pending-review';
import { MdAdd, MdClose } from 'react-icons/md';
import VisibilityIcon from '@mui/icons-material/Visibility';
import validateForm from '../../utils/form-validation';
import { Link, useNavigate } from 'react-router';
import * as paths from '../../paths';
import FlowLink, { FlowLinkProps } from './flow-link';
import FlowSearch from './flow-search';
import FlowLinkWarning from './flow-link-warning';
import {
  currencyToInteger,
  integerToCurrency,
  valueToInteger,
} from '../../utils/map-functions';
import ReportingDetail, {
  REPORTING_DETAIL_INITIAL_VALUES,
  ReportingDetailProps,
} from '../reporting-detail';
import dayjs from '../../../libs/dayjs';
import type { Dayjs } from 'dayjs';
import {
  autofillFieldClusters,
  autofillGlobalClusters,
  autofillOrganizations,
  autofillPlan,
  autofillProject,
  autofillUsageYears,
} from '../../utils/fn-autofills';
import {
  validateFlowForWarnings,
  validateFlowIsUnlinked,
} from '../../utils/fn-validations';
import React, { useState } from 'react';
import DatePickerReview from './inputs/date-picker-pending-review';
import { PENDING_REVIEW } from '../../utils/constants';
import AutocompleteSelectReview from './inputs/autocomplete-pending-review';
import { LanguageKey, t } from '../../../i18n';

type FlowFormProps = {
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  load: () => void;
  inactiveReasons: categories.GetCategoriesResult;
  flowType: FormObjectValue[];
  contributionType: FormObjectValue[];
  method: FormObjectValue[];
  initialValues?: FlowFormType;
  flow?: flows.GetFlowResult;
  isPending?: boolean;
  isInactive?: boolean;
};

export type FlowFormType = {
  fundingSourceOrganizations: FormObjectValue[];
  fundingSourceUsageYears: FormObjectValue[];
  fundingSourceLocations: FormObjectValue[];
  fundingSourceEmergencies: FormObjectValue[];
  fundingSourceGlobalClusters: FormObjectValue[];
  fundingSourceFieldClusters: FormObjectValue[];
  fundingSourceProject: FormObjectValue | null;
  fundingSourcePlan: FormObjectValue | null;

  fundingDestinationOrganizations: FormObjectValue[];
  fundingDestinationUsageYears: FormObjectValue[];
  fundingDestinationLocations: FormObjectValue[];
  fundingDestinationEmergencies: FormObjectValue[];
  fundingDestinationGlobalClusters: FormObjectValue[];
  fundingDestinationFieldClusters: FormObjectValue[];
  fundingDestinationProject: FormObjectValue | null;
  fundingDestinationPlan: FormObjectValue | null;

  isNewMoney: boolean;
  amountUSD: string;
  amountOriginalCurrency: string;
  currency: FormObjectValue | null;
  exchangeRate: string;
  flowDescription: string;
  firstReported: Dayjs | null;
  decisionDate: Dayjs | null;
  donorBudgetYear: string;
  flowType: FormObjectValue | null;
  flowStatus: FormObjectValue | null;
  flowDate: Dayjs | null;
  contributionType: FormObjectValue | null;
  earmarkingType: FormObjectValue | null;
  method: FormObjectValue | null;
  keywords: FormObjectValue[];
  beneficiaryGroup: FormObjectValue | null;
  notes: string;

  parentFlow: FlowLinkProps | null;
  childFlows: FlowLinkProps[];

  reportingDetails: ReportingDetailProps[];

  restricted: boolean;
  isErrorCorrection: boolean;
  isInactive: boolean;
};

export type FlowFormTypeValidated = Omit<
  FlowFormType,
  'firstReported' | 'flowDate' | 'flowStatus'
> & {
  firstReported: NonNullable<FlowFormType['firstReported']>;
  flowDate: NonNullable<FlowFormType['flowDate']>;
  flowStatus: NonNullable<FlowFormType['flowStatus']>;
};

type ConsistencyErrorReasons = {
  usageYears: Array<
    { refDirection: RefDirection; options: number[] } & usageYears.UsageYear
  >;
  locations: Array<
    {
      refDirection: RefDirection;
      options: locations.Location[];
    } & locations.Location
  >;
  governingEntities: Array<
    {
      name: string;
      refDirection: RefDirection;
      options: Array<{ name: string } & governingEntities.GoverningEntity>;
    } & governingEntities.GoverningEntity
  >;
};
type ConsistencyErrorReasonMap = {
  [K in keyof ConsistencyErrorReasons]: {
    type: K;
    values: ConsistencyErrorReasons[K];
  };
}[keyof ConsistencyErrorReasons];

const UNTreasuryLinkComponent = tw.a`
  text-lg
  float-end
`;
const FormGroupPaper = tw(Paper)`
  p-6
`;
const SPAN_STYLES = `
  px-2
  py-1
  mx-2
  border
  border-solid
  rounded-[4px]
`;
const LatestSpan = tw.span`
  ${SPAN_STYLES}
  bg-unocha-success-light
  border-unocha-success
`;
const PendingReviewSpan = tw.span`
  ${SPAN_STYLES}
  bg-unocha-pallete-orange-light
  border-unocha-pallete-orange
`;

export const INITIAL_FORM_VALUES: FlowFormType = {
  fundingSourceOrganizations: [],
  fundingSourceUsageYears: [],
  fundingSourceLocations: [],
  fundingSourceEmergencies: [],
  fundingSourceGlobalClusters: [],
  fundingSourceFieldClusters: [],
  fundingSourceProject: null,
  fundingSourcePlan: null,

  fundingDestinationOrganizations: [],
  fundingDestinationUsageYears: [],
  fundingDestinationLocations: [],
  fundingDestinationEmergencies: [],
  fundingDestinationGlobalClusters: [],
  fundingDestinationFieldClusters: [],
  fundingDestinationProject: null,
  fundingDestinationPlan: null,

  isNewMoney: true,
  amountUSD: '',
  amountOriginalCurrency: '',
  currency: null,
  exchangeRate: '',
  flowDescription: '',
  firstReported: null,
  decisionDate: null,
  donorBudgetYear: '',
  flowType: null,
  flowStatus: null,
  flowDate: null,
  contributionType: null,
  earmarkingType: null,
  method: null,
  keywords: [],
  beneficiaryGroup: null,
  notes: '',

  parentFlow: null,
  childFlows: [],

  reportingDetails: [REPORTING_DETAIL_INITIAL_VALUES],

  restricted: false,
  isErrorCorrection: false,
  isInactive: false,
};

export type FlowFormValidationKeys =
  | 'amountUSD'
  | 'amountOriginalCurrency'
  | 'donorBudgetYear'
  | 'exchangeRate'
  | 'flowStatus'
  | 'flowDescription'
  | 'firstReported'
  | 'flowDate'
  | 'fundingSourceUsageYears'
  | 'fundingDestinationUsageYears';

const FORM_VALIDATION_SCHEMA: io.TypeC<
  Record<FlowFormValidationKeys, io.Mixed>
> = io.type({
  amountUSD: codecs.CURRENCY_INTEGER_GREATER_THAN_0_FROM_STRING,
  amountOriginalCurrency: io.union([
    codecs.EMPTY_STRING,
    codecs.POSITIVE_NUMBER_FROM_STRING,
  ]),
  donorBudgetYear: io.union([codecs.EMPTY_STRING, codecs.YEAR_FROM_STRING]),
  exchangeRate: io.union([
    codecs.EMPTY_STRING,
    codecs.POSITIVE_NUMBER_FROM_STRING,
  ]),
  flowStatus: codecs.NON_NULL_VALUE,
  flowDescription: codecs.NON_EMPTY_STRING,
  firstReported: codecs.VALID_DAYJS_DATE,
  flowDate: codecs.VALID_DAYJS_DATE,
  fundingSourceUsageYears: codecs.NON_EMPTY_ARRAY,
  fundingDestinationUsageYears: codecs.NON_EMPTY_ARRAY,
});

const validationErrorMessages = (
  lang: LanguageKey
): Record<keyof io.TypeOf<typeof FORM_VALIDATION_SCHEMA>, string> => {
  const VALIDATION_FIELDS = [
    'amountUSD',
    'amountOriginalCurrency',
    'donorBudgetYear',
    'exchangeRate',
    'flowStatus',
    'flowDescription',
    'firstReported',
    'flowDate',
    'fundingSourceUsageYears',
    'fundingDestinationUsageYears',
  ] as const;

  const messageMap = VALIDATION_FIELDS.reduce(
    (recordMap, currentField) => {
      recordMap[currentField] = t.t(
        lang,
        (s) => s.components.flowForm.codecValidation[currentField]
      );
      return recordMap;
    },
    {} as Record<(typeof VALIDATION_FIELDS)[number], string>
  );

  return messageMap;
};

export const FormGroup = ({
  title,
  children,
  styles,
  closeButtonAction,
}: {
  title: string;
  children?: React.ReactNode;
  styles?: SxProps<Theme>;
  closeButtonAction?: () => void;
}) => {
  return (
    <FormGroupPaper elevation={3} sx={styles}>
      <Box sx={tw`flex items-center justify-between`}>
        <h2>{title}</h2>
        {closeButtonAction && (
          <MdClose onClick={closeButtonAction} style={{ cursor: 'pointer' }} />
        )}
      </Box>
      {children}
    </FormGroupPaper>
  );
};

const FlowAmountButton = ({
  amountUSD,
  amountOriginalCurrency,
  exchangeRate,
  setFieldValue,
  disabled,
}: {
  amountUSD: FlowFormType['amountUSD'];
  amountOriginalCurrency: FlowFormType['amountOriginalCurrency'];
  exchangeRate: FlowFormType['exchangeRate'];
  setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'];
  disabled?: boolean;
}) => {
  const { lang } = getContext();

  if (disabled) return;
  const amountUSDInt = currencyToInteger(amountUSD);
  const amountOriginalCurrencyInt = currencyToInteger(amountOriginalCurrency);
  const exchangeRateFloat = parseFloat(exchangeRate);

  if (amountUSDInt && amountOriginalCurrencyInt && !exchangeRateFloat) {
    const buttonProps = {
      onClick: () =>
        setFieldValue('exchangeRate', amountOriginalCurrencyInt / amountUSDInt),
      text: t.t(lang, (s) => s.components.flowAmountButton.exchangeRate),
    };
    return <C.Button color="primary" {...buttonProps} className="text-end" />;
  } else if (amountUSDInt && !amountOriginalCurrencyInt && exchangeRateFloat) {
    const buttonProps = {
      onClick: () =>
        setFieldValue(
          'amountOriginalCurrency',
          valueToInteger(amountUSDInt * exchangeRateFloat)
        ),
      text: t.t(
        lang,
        (s) => s.components.flowAmountButton.amountOriginalCurrency
      ),
    };
    return <C.Button color="primary" {...buttonProps} className="text-end" />;
  } else if (!amountUSDInt && amountOriginalCurrencyInt && exchangeRateFloat) {
    const buttonProps = {
      onClick: () =>
        setFieldValue(
          'amountUSD',
          valueToInteger(amountOriginalCurrencyInt / exchangeRateFloat)
        ),
      text: t.t(lang, (s) => s.components.flowAmountButton.amountUSD),
    };
    return <C.Button color="primary" {...buttonProps} className="text-end" />;
  }
  return;
};

export const FlowForm = (props: FlowFormProps) => {
  const { env: getEnv, lang } = getContext();
  const env = getEnv();
  const navigate = useNavigate();

  const {
    setError,
    load,
    initialValues,
    flow,
    isPending,
    isInactive,
    inactiveReasons,
    flowType,
    contributionType,
    method,
  } = props;
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingValuesHandled, setPendingValuesHandled] = useState(0);

  const pendingValues = isPending
    ? pendingValuesFlowForm(initialValues, flow)
    : undefined;

  const pendingReviewCategory = inactiveReasons.find(
    (category) => category.name === PENDING_REVIEW
  );

  const isDisabled = isInactive && !isPending;
  const isDeleted = !!flow?.deletedAt;

  const flowInitialValues = initialValues ?? {
    ...INITIAL_FORM_VALUES,
    flowType:
      flowType.find((v) => v.displayLabel === 'Standard') ??
      INITIAL_FORM_VALUES['flowType'],
    contributionType:
      contributionType.find((v) => v.displayLabel === 'Financial') ??
      INITIAL_FORM_VALUES['contributionType'],
    method:
      method.find((v) => v.displayLabel === 'Traditional aid') ??
      INITIAL_FORM_VALUES['method'],
  };

  const isValid = async (
    values: FlowFormTypeValidated,
    validateIfFlow?: boolean
  ) => {
    if (validateIfFlow && !flow) {
      return false;
    }
    if (!(await validateFlowForWarnings(values, setError, env, lang))) {
      return false;
    }
    if (
      isPending &&
      pendingValues &&
      pendingValuesHandled !== Object.keys(pendingValues).length
    ) {
      setError(
        t.t(lang, (s) => s.components.flowForm.submitValidation.pendingValues)
      );
      return false;
    }
    return true;
  };

  const isUsageYearValues = (
    value: ConsistencyErrorReasons[keyof ConsistencyErrorReasons][number],
    type: keyof ConsistencyErrorReasons
  ): value is ConsistencyErrorReasons['usageYears'][number] =>
    type === 'usageYears';
  const isDataConsistencyErrorMap = (
    reason: errors.DataConsistencyErrorReason[number]
  ): reason is ConsistencyErrorReasonMap => {
    const KEYS: (keyof ConsistencyErrorReasons)[] = [
      'usageYears',
      'locations',
      'governingEntities',
    ];
    return KEYS.some((key) => key === reason.type);
  };
  const handleDataConsistencyError = (err: errors.DataConsistencyError) => {
    const message = err.reason
      .map((r) => {
        let messageReason = '';
        if (!isDataConsistencyErrorMap(r)) {
          return messageReason;
        }
        const { type, values } = r;
        messageReason += t.t(
          lang,
          (s) => s.components.flowForm.submitValidation.dataConsistency,
          {
            entity: type,
            selected: values
              .map((v) => (isUsageYearValues(v, type) ? v.year : v.name))
              .join(', '),
            expected: [
              ...new Set(
                values.flatMap((v) =>
                  isUsageYearValues(v, type)
                    ? v.options.map((o) => `${o}`)
                    : v.options.map((o) => o.name)
                )
              ),
            ].join(', '),
          }
        );
        return messageReason;
      })
      .join(' | ');

    return message;
  };

  const handleSubmit = async (
    values: FlowFormTypeValidated,
    isSaved?: boolean
  ) => {
    setSubmitLoading(true);
    const valid = await isValid(values);
    if (!valid) {
      setSubmitLoading(false);
      return;
    }
    if (flow?.id) {
      env.model.flows
        .updateFlow({
          flow: {
            ...parseFlowForm(values, inactiveReasons, initialValues, {
              isApproved: isPending && !isSaved,
              isSaved,
            }).flow,
            id: flow.id,
            versionID: flow.versionID,
          },
        })
        .then(() => {
          load();
        })
        .catch((err) => {
          if (errors.isDataConsistencyError(err)) {
            setError(handleDataConsistencyError(err));
            return;
          }
          const errorMessage = err.json.message;
          if (typeof errorMessage === 'string') {
            setError(errorMessage);
          } else {
            setError(
              t.t(
                lang,
                (s) => s.components.flowForm.submitValidation.unknownError
              )
            );
          }
        })
        .finally(() => setSubmitLoading(false));
    } else {
      env.model.flows
        .createFlow(parseFlowForm(values, inactiveReasons, initialValues))
        .then((res) => {
          navigate(paths.flow(res.id, res.versionID), {
            state: {
              successMessage: t.t(
                lang,
                (s) => s.components.flowForm.submitValidation.createSuccess
              ),
            },
          });
        })
        .catch((err) => {
          console.error(err);
          const errorMessage = err.json.message;
          if (typeof errorMessage === 'string') {
            setError(errorMessage);
          } else {
            setError(
              t.t(
                lang,
                (s) => s.components.flowForm.submitValidation.unknownError
              )
            );
          }
        })
        .finally(() => setSubmitLoading(false));
    }
  };
  const handleChangeFirstReported = (
    newValue: Dayjs | null,
    setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'],
    values: FlowFormType
  ) => {
    // Create a deep copy of the reportingDetails array
    const newReportingDetails = values.reportingDetails.map((reportingDetail) =>
      // Only update if dateReported is null/undefined
      !reportingDetail.dateReported
        ? { ...reportingDetail, dateReported: newValue }
        : reportingDetail
    );

    // Update both reportingDetails and firstReported fields in Formik's state
    setFieldValue('reportingDetails', newReportingDetails);
    setFieldValue('firstReported', newValue);
  };

  const handleSearchSimilarFlows = async (
    definedInitialValues: FlowFormType
  ) => {
    const flowsFilterValues = await queryParamsFlowFilter(
      definedInitialValues,
      env
    );

    const newUrl = `${paths.flows()}?${flowsFilterValues}`;
    window.open(newUrl, '_blank');
  };

  const handleDeleteFlow = async (values: FlowFormType) => {
    setDeleteLoading(true);
    if (
      !window.confirm(
        t.t(
          lang,
          (s) => s.components.flowForm.submitValidation.deleteFlowWarning
        )
      )
    ) {
      setDeleteLoading(false);
      return;
    }
    if (!validateFlowIsUnlinked(values) || !flow) {
      setError(
        t.t(
          lang,
          (s) => s.components.flowForm.submitValidation.deleteLinkedFlows
        )
      );
      setDeleteLoading(false);
      return;
    }
    env.model.flows
      .deleteFlow({
        flowId: flow.id,
        versionID: flow.versionID,
      })
      .then(() => {
        navigate(paths.flows(), {
          state: {
            successMessage: t.t(
              lang,
              (s) => s.components.flowForm.submitValidation.deleteSuccess
            ),
          },
        });
      })
      .catch((err) => {
        console.error(err);
        // TODO: Verify err.json.message is a possible error
        const errorMessage = err.json.message;
        if (typeof errorMessage === 'string') {
          setError(errorMessage);
        } else {
          setError(
            t.t(
              lang,
              (s) => s.components.flowForm.submitValidation.unknownError
            )
          );
        }
      })
      .finally(() => setDeleteLoading(false));
  };

  const handleRejectFlow = async (values: FlowFormType) => {
    setRejectLoading(true);
    if (!flow) {
      setRejectLoading(false);
      return;
    }
    if (
      !window.confirm(
        t.t(lang, (s) => s.components.flowForm.rejectFlow.confirm)
      )
    ) {
      setRejectLoading(false);
      return;
    }
    const rejected = inactiveReasons.find(
      (category) => category.name === 'Rejected'
    );

    if (!rejected) {
      setError(
        t.t(lang, (s) => s.components.flowForm.rejectFlow.categoryNotFound)
      );
      return;
    }

    const newFlow = parseFlowForm(
      values as FlowFormTypeValidated,
      inactiveReasons,
      initialValues,
      {
        isApproved: isPending,
      }
    ).flow;

    env.model.flows
      .updateFlow({
        flow: {
          ...newFlow,
          activeStatus: false,
          categories: [...newFlow.categories, rejected.id],
          inactiveReason: [...(newFlow.inactiveReason ?? []), rejected],
          id: flow.id,
          versionID: flow.versionID,
        },
      })
      .then(() => {
        load();
      })
      .catch((err) => {
        const errorMessage = err.json.message;
        if (typeof errorMessage === 'string') {
          setError(errorMessage);
        } else {
          setError(
            t.t(
              lang,
              (s) => s.components.flowForm.submitValidation.unknownError
            )
          );
        }
      })
      .finally(() => setRejectLoading(false));
  };

  return (
    <Formik
      initialValues={flowInitialValues}
      onSubmit={(values) => handleSubmit(values as FlowFormTypeValidated)}
      validate={(values) =>
        validateForm(
          values,
          FORM_VALIDATION_SCHEMA,
          validationErrorMessages(lang)
        )
      }
    >
      {({ values, isValid, setFieldValue }) => (
        <Form>
          {!isDisabled && (
            <C.CheckBox
              name="restricted"
              label={t.t(lang, (s) => s.components.flowForm.fields.restricted)}
            />
          )}
          {initialValues && flow && !isDeleted && (
            <Box sx={tw`flex gap-x-6 items-center`}>
              <C.CheckBox
                name="isErrorCorrection"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.isErrorCorrection
                )}
              />
              <C.CheckBox
                name="isInactive"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.isInactive
                )}
                disabled={isDisabled}
              />
              <Link
                to={paths.addFlow()}
                state={{
                  flowFormCopyValues: serializeFlowForm(values),
                  flowFormCopyValuesName: `${flow?.id}v${flow?.versionID}`,
                }}
              >
                {t.t(lang, (s) => s.components.flowForm.copyFlow)}
              </Link>
              <C.Button
                color="primary"
                onClick={() => {
                  handleSearchSimilarFlows(initialValues);
                }}
                text={t.t(lang, (s) => s.components.flowForm.searchSimilarFlow)}
              />
              <C.Button
                color="secondary"
                onClick={() => handleDeleteFlow(values)}
                text={t.t(lang, (s) => s.components.flowForm.deleteFlow)}
                displayLoading={deleteLoading}
              />
              {isPending && (
                <C.Button
                  color="secondary"
                  onClick={() => handleRejectFlow(values)}
                  text={t.t(
                    lang,
                    (s) => s.components.flowForm.rejectFlow.button
                  )}
                  displayLoading={rejectLoading}
                />
              )}
            </Box>
          )}
          <Box sx={tw`flex mt-6 mx-6 gap-x-10`}>
            <FormGroup
              title={t.t(
                lang,
                (s) => s.components.flowForm.sectionTitles.sourceFlow
              )}
              styles={tw`basis-2/12 sticky top-20 h-fit max-w-[16.666%]`}
            >
              {values.parentFlow && (
                <FlowLinkWarning
                  text={t.t(
                    lang,
                    (s) => s.components.flowForm.warning.sourceFlow
                  )}
                />
              )}
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourceOrganizations"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingSourceOrganizations
                )}
                fnPromise={(query) => fnOrganizations(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) => {
                  autofillOrganizations({
                    fieldName: 'fundingSourceOrganizations',
                    setFieldValue,
                    values,
                    env,
                    newValue,
                  });
                }}
                disabled={isDisabled || !!values.parentFlow}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourceOrganizations
                    : undefined
                }
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourceUsageYears"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingSourceUsageYears
                )}
                fnPromise={() => fnUsageYears(env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) =>
                  autofillUsageYears({
                    fieldName: 'fundingSourceUsageYears',
                    setFieldValue,
                    values,
                    env,
                    newValue,
                  })
                }
                isAutocompleteAPI={false}
                disabled={isDisabled || !!values.parentFlow}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourceUsageYears
                    : undefined
                }
                isMulti
                required
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourceLocations"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingSourceLocations
                )}
                fnPromise={(query) => fnLocations(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                disabled={isDisabled || !!values.parentFlow}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourceLocations
                    : undefined
                }
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourceEmergencies"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingSourceEmergencies
                )}
                fnPromise={(query) => fnEmergencies(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                disabled={isDisabled || !!values.parentFlow}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourceEmergencies
                    : undefined
                }
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourceGlobalClusters"
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowForm.fields.fundingSourceGlobalClusters
                )}
                fnPromise={() => fnGlobalClusters(env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) =>
                  autofillGlobalClusters({
                    fieldName: 'fundingSourceGlobalClusters',
                    setFieldValue,
                    env,
                    values,
                    newValue,
                  })
                }
                isAutocompleteAPI={false}
                disabled={isDisabled || !!values.parentFlow}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourceGlobalClusters
                    : undefined
                }
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourcePlan"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingSourcePlan
                )}
                fnPromise={(query) => fnPlans(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) => {
                  autofillPlan({
                    fieldName: 'fundingSourcePlan',
                    setFieldValue,
                    values,
                    env,
                    newValue,
                  });
                }}
                disabled={isDisabled || !!values.parentFlow}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourcePlan
                    : undefined
                }
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourceFieldClusters"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingSourceFieldClusters
                )}
                fnPromise={() =>
                  values.fundingSourcePlan?.value
                    ? fnGoverningEntities(
                        env,
                        valueToInteger(values.fundingSourcePlan.value)
                      )
                    : new Promise<FormObjectValue[]>((resolve) => resolve([]))
                }
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) =>
                  autofillFieldClusters({
                    fieldName: 'fundingSourceFieldClusters',
                    setFieldValue,
                    env,
                    newValue,
                    values,
                  })
                }
                disabled={isDisabled || values.fundingSourcePlan === null}
                isAutocompleteAPI={false}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourceFieldClusters
                    : undefined
                }
                isMulti
                observedValue={values.fundingSourcePlan?.value.toString()}
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingSourceProject"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingSourceProject
                )}
                fnPromise={(query) => fnProjects(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) => {
                  autofillProject({
                    fieldName: 'fundingSourceProject',
                    setFieldValue,
                    values,
                    env,
                    newValue,
                  });
                }}
                disabled={isDisabled || !!values.parentFlow}
                pendingValues={
                  !values.parentFlow
                    ? pendingValues?.fundingSourceProject
                    : undefined
                }
              />
            </FormGroup>

            <Box sx={tw`basis-3/5 max-w-[60%] flex flex-col gap-y-4`}>
              <FormGroup
                title={t.t(
                  lang,
                  (s) => s.components.flowForm.sectionTitles.flowDetails
                )}
              >
                <Box sx={tw`grid grid-cols-2 gap-y-8 gap-x-24`}>
                  <div>
                    <C.CheckBox
                      name="isNewMoney"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.isNewMoney
                      )}
                      disabled={isDisabled}
                    />
                    <NumberFieldReview
                      fieldName="amountUSD"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.amountUSD
                      )}
                      type="currency"
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.amountUSD}
                      required
                    />
                    <Box
                      sx={tw`border border-unocha-panel-border border-solid rounded px-4 py-8`}
                    >
                      <Box sx={tw`flex`}>
                        <NumberFieldReview
                          fieldName="amountOriginalCurrency"
                          label={t.t(
                            lang,
                            (s) =>
                              s.components.flowForm.fields
                                .amountOriginalCurrency
                          )}
                          type="unknownCurrency"
                          setPendingValuesHandled={setPendingValuesHandled}
                          sx={tw`basis-4/6`}
                          disabled={isDisabled}
                          pendingValues={pendingValues?.amountOriginalCurrency}
                        />
                        <AsyncAutocompleteSelectReview
                          fieldName="currency"
                          label={t.t(
                            lang,
                            (s) => s.components.flowForm.fields.currency
                          )}
                          fnPromise={() => fnCurrencies(env)}
                          setPendingValuesHandled={setPendingValuesHandled}
                          isAutocompleteAPI={false}
                          sx={tw`basis-2/6`}
                          disabled={isDisabled}
                          pendingValues={pendingValues?.currency}
                        />
                      </Box>
                      <NumberFieldReview
                        fieldName="exchangeRate"
                        label={t.t(
                          lang,
                          (s) => s.components.flowForm.fields.exchangeRate
                        )}
                        type="float"
                        setPendingValuesHandled={setPendingValuesHandled}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.exchangeRate}
                      />
                      <UNTreasuryLinkComponent
                        href="https://treasury.un.org/operationalrates/OperationalRates.php"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.t(
                          lang,
                          (s) => s.components.flowForm.links.UNTreasury
                        )}
                      </UNTreasuryLinkComponent>
                      <FlowAmountButton
                        setFieldValue={setFieldValue}
                        amountUSD={values.amountUSD}
                        amountOriginalCurrency={values.amountOriginalCurrency}
                        exchangeRate={values.exchangeRate}
                        disabled={isDisabled}
                      />
                    </Box>
                    <TextFieldReview
                      fieldName="flowDescription"
                      label={t.t(
                        lang,
                        (s) =>
                          s.components.flowForm.fields.flowDescription.label
                      )}
                      placeholder={t.t(
                        lang,
                        (s) =>
                          s.components.flowForm.fields.flowDescription
                            .placeholder
                      )}
                      setPendingValuesHandled={setPendingValuesHandled}
                      required
                      textarea
                      minRows={2}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.flowDescription}
                    />
                    <Box sx={tw`flex gap-4`}>
                      <DatePickerReview
                        label={t.t(
                          lang,
                          (s) => s.components.flowForm.fields.firstReported
                        )}
                        fieldName="firstReported"
                        onChange={(value) =>
                          handleChangeFirstReported(
                            value,
                            setFieldValue,
                            values
                          )
                        }
                        setPendingValuesHandled={setPendingValuesHandled}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.firstReported}
                        todayText={t.t(
                          lang,
                          (s) => s.components.datePicker.today
                        )}
                        required
                      />
                      <DatePickerReview
                        label={t.t(
                          lang,
                          (s) => s.components.flowForm.fields.decisionDate
                        )}
                        fieldName="decisionDate"
                        setPendingValuesHandled={setPendingValuesHandled}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.decisionDate}
                        todayText={t.t(
                          lang,
                          (s) => s.components.datePicker.today
                        )}
                      />
                    </Box>
                    <NumberFieldReview
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.donorBudgetYear
                      )}
                      fieldName="donorBudgetYear"
                      type="number"
                      placeholder="YYYY"
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.donorBudgetYear}
                    />
                  </div>
                  <div>
                    <AutocompleteSelectReview
                      fieldName="flowType"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.flowType
                      )}
                      options={flowType}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.flowType}
                      required
                    />
                    <AsyncAutocompleteSelectReview
                      fieldName="flowStatus"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.flowStatus
                      )}
                      fnPromise={() => fnFlowStatusId(env)}
                      setPendingValuesHandled={setPendingValuesHandled}
                      isAutocompleteAPI={false}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.flowStatus}
                      required
                    />
                    <DatePickerReview
                      fieldName="flowDate"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.flowDate
                      )}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.flowDate}
                      todayText={t.t(
                        lang,
                        (s) => s.components.datePicker.today
                      )}
                      required
                    />
                    <AutocompleteSelectReview
                      fieldName="contributionType"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.contributionType
                      )}
                      options={contributionType}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.contributionType}
                    />
                    <AsyncAutocompleteSelectReview
                      fieldName="earmarkingType"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.earmarkingType
                      )}
                      fnPromise={() => fnCategories('earmarkingType', env)}
                      setPendingValuesHandled={setPendingValuesHandled}
                      isAutocompleteAPI={false}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.earmarkingType}
                    />
                    <AutocompleteSelectReview
                      fieldName="method"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.method
                      )}
                      options={method}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.method}
                      required
                    />
                    <AsyncAutocompleteSelectReview
                      fieldName="keywords"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.keywords
                      )}
                      fnPromise={() => fnCategories('keywords', env)}
                      setPendingValuesHandled={setPendingValuesHandled}
                      isAutocompleteAPI={false}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.keywords}
                      isMulti
                    />
                    <AsyncAutocompleteSelectReview
                      fieldName="beneficiaryGroup"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.beneficiaryGroup
                      )}
                      fnPromise={() => fnCategories('beneficiaryGroup', env)}
                      setPendingValuesHandled={setPendingValuesHandled}
                      isAutocompleteAPI={false}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.beneficiaryGroup}
                    />
                  </div>
                </Box>
                <TextFieldReview
                  fieldName="notes"
                  label={t.t(lang, (s) => s.components.flowForm.fields.notes)}
                  setPendingValuesHandled={setPendingValuesHandled}
                  textarea
                  minRows={3}
                  disabled={isDisabled}
                  pendingValues={pendingValues?.notes}
                />
              </FormGroup>
              <FormGroup
                title={t.t(
                  lang,
                  (s) => s.components.flowForm.sectionTitles.flowLink
                )}
              >
                {values.parentFlow && (
                  <Box sx={tw`my-4`}>
                    <h3>Parent Flow</h3>
                    <FlowLink
                      flowLink={values.parentFlow}
                      fieldName="parentFlow"
                    />
                  </Box>
                )}

                {values.childFlows.length > 0 && (
                  <Box sx={tw`mb-4`}>
                    <h3>Child Flows</h3>
                    <Box sx={tw`flex flex-col gap-y-4 my-4`}>
                      {values.childFlows.map((childFlow) => (
                        <div key={childFlow.id}>
                          <FlowLink
                            flowLink={childFlow}
                            fieldName="childFlows"
                          />
                        </div>
                      ))}
                    </Box>
                    <Box sx={tw`text-end font-bold`}>
                      <span>
                        {values.amountUSD
                          ? 'US$' +
                            integerToCurrency(
                              currencyToInteger(values.amountUSD) -
                                values.childFlows.reduce(
                                  (acc, cur) =>
                                    acc + valueToInteger(cur.amountUSD),
                                  0
                                )
                            )
                          : undefined}
                      </span>
                    </Box>
                  </Box>
                )}
                {!isDisabled && (
                  <Box sx={tw`flex gap-x-4`}>
                    {!values.parentFlow && (
                      <FlowSearch
                        name="parentFlow"
                        text={t.t(
                          lang,
                          (s) => s.components.flowForm.fields.parentFlow
                        )}
                        startIcon={MdAdd}
                      />
                    )}
                    <FlowSearch
                      name="childFlows"
                      text={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.childFlows
                      )}
                      startIcon={MdAdd}
                    />
                  </Box>
                )}
              </FormGroup>
              {values.reportingDetails.length > 0 ? (
                values.reportingDetails.map((_, index) => (
                  <React.Fragment key={index}>
                    <ReportingDetail
                      index={index}
                      disabled={
                        (isDisabled &&
                          initialValues &&
                          index < initialValues.reportingDetails.length) ||
                        isDeleted
                      }
                    />
                  </React.Fragment>
                ))
              ) : (
                <ReportingDetail index={0} disabled={isDisabled} />
              )}
              {!isDeleted && (
                <C.Button
                  text={t.t(
                    lang,
                    (s) => s.components.flowForm.addReportingDetail
                  )}
                  onClick={() =>
                    setFieldValue('reportingDetails', [
                      ...values.reportingDetails,
                      REPORTING_DETAIL_INITIAL_VALUES,
                    ])
                  }
                  color="primary"
                />
              )}
              {(flow?.versions?.length ?? 0) > 0 && (
                <FormGroup
                  title={t.t(
                    lang,
                    (s) => s.components.flowForm.sectionTitles.flowVersion
                  )}
                >
                  <Box sx={tw`flex flex-col px-4 gap-y-6`}>
                    {flow?.versions
                      ?.sort(
                        (flowVersion, previous) =>
                          previous.versionID - flowVersion.versionID
                      )
                      .map((flowVersion) => (
                        <span
                          key={`flowVersion${flowVersion.id}v${flowVersion.versionID}`}
                        >
                          {flowVersion.versionID === flow?.versionID && (
                            <VisibilityIcon
                              color="primary"
                              sx={tw`me-4 float-start`}
                            />
                          )}
                          <Link
                            to={paths.flow(
                              flowVersion.id,
                              flowVersion.versionID
                            )}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                          >
                            #{flowVersion.id}v{flowVersion.versionID}
                          </Link>{' '}
                          {flowVersion.activeStatus && (
                            <LatestSpan>
                              {t.t(
                                lang,
                                (s) => s.components.flowForm.activeTag
                              )}
                            </LatestSpan>
                          )}
                          {flowVersion.categories.some(
                            (cat) =>
                              cat.categoryID === pendingReviewCategory?.id
                          ) && (
                            <PendingReviewSpan>
                              {t.t(
                                lang,
                                (s) => s.components.flowForm.pendingReviewTag
                              )}
                            </PendingReviewSpan>
                          )}
                          {t.t(
                            lang,
                            (s) => s.components.flowForm.createdUpdated,
                            {
                              createdDate: dayjs(
                                flowVersion.createdAt
                              ).format(),
                              updatedDate: dayjs(
                                flowVersion.updatedAt
                              ).format(),
                            }
                          )}
                        </span>
                      ))}
                  </Box>
                </FormGroup>
              )}
            </Box>

            <FormGroup
              title={t.t(
                lang,
                (s) => s.components.flowForm.sectionTitles.destinationFlow
              )}
              styles={tw`basis-2/12 sticky top-20 h-fit max-w-[16.666%]`}
            >
              {values.childFlows.length > 0 && (
                <FlowLinkWarning
                  text={t.t(
                    lang,
                    (s) => s.components.flowForm.warning.destinationFlow
                  )}
                />
              )}
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationOrganizations"
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowForm.fields.fundingDestinationOrganizations
                )}
                fnPromise={(query) => fnOrganizations(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                disabled={isDisabled}
                pendingValues={pendingValues?.fundingDestinationOrganizations}
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationUsageYears"
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowForm.fields.fundingDestinationUsageYears
                )}
                fnPromise={() => fnUsageYears(env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) =>
                  autofillUsageYears({
                    fieldName: 'fundingDestinationUsageYears',
                    setFieldValue,
                    values,
                    env,
                    newValue,
                  })
                }
                isAutocompleteAPI={false}
                disabled={isDisabled}
                pendingValues={pendingValues?.fundingDestinationUsageYears}
                isMulti
                required
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationLocations"
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowForm.fields.fundingDestinationLocations
                )}
                fnPromise={(query) => fnLocations(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                disabled={isDisabled}
                pendingValues={pendingValues?.fundingDestinationLocations}
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationEmergencies"
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowForm.fields.fundingDestinationEmergencies
                )}
                fnPromise={(query) => fnEmergencies(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                disabled={isDisabled}
                pendingValues={pendingValues?.fundingDestinationEmergencies}
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationGlobalClusters"
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowForm.fields
                      .fundingDestinationGlobalClusters
                )}
                fnPromise={() => fnGlobalClusters(env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) =>
                  autofillGlobalClusters({
                    fieldName: 'fundingDestinationGlobalClusters',
                    setFieldValue,
                    env,
                    values,
                    newValue,
                  })
                }
                isAutocompleteAPI={false}
                disabled={isDisabled}
                pendingValues={pendingValues?.fundingDestinationGlobalClusters}
                isMulti
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationPlan"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingDestinationPlan
                )}
                fnPromise={(query) => fnPlans(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) => {
                  autofillPlan({
                    fieldName: 'fundingDestinationPlan',
                    setFieldValue,
                    values,
                    env,
                    newValue,
                  });
                }}
                disabled={isDisabled}
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationFieldClusters"
                label={t.t(
                  lang,
                  (s) =>
                    s.components.flowForm.fields.fundingDestinationFieldClusters
                )}
                fnPromise={() =>
                  values.fundingDestinationPlan?.value
                    ? fnGoverningEntities(
                        env,
                        valueToInteger(values.fundingDestinationPlan.value)
                      )
                    : new Promise<FormObjectValue[]>((resolve) => resolve([]))
                }
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) =>
                  autofillFieldClusters({
                    fieldName: 'fundingDestinationFieldClusters',
                    setFieldValue,
                    env,
                    newValue,
                    values,
                  })
                }
                disabled={isDisabled || values.fundingDestinationPlan === null}
                isAutocompleteAPI={false}
                pendingValues={pendingValues?.fundingDestinationFieldClusters}
                isMulti
                observedValue={values.fundingDestinationPlan?.value.toString()}
              />
              <AsyncAutocompleteSelectReview
                fieldName="fundingDestinationProject"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.fundingDestinationProject
                )}
                fnPromise={(query) => fnProjects(query, env)}
                setPendingValuesHandled={setPendingValuesHandled}
                onChange={(newValue) => {
                  autofillProject({
                    fieldName: 'fundingDestinationProject',
                    setFieldValue,
                    values,
                    env,
                    newValue,
                  });
                }}
                disabled={isDisabled}
                pendingValues={pendingValues?.fundingDestinationProject}
              />
            </FormGroup>
          </Box>
          {!isDeleted && (
            <Snackbar
              open
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={tw`rounded-[4px] bg-unocha-primary`}
              TransitionComponent={Grow}
            >
              <Box sx={tw`px-10 py-3 flex gap-x-4 items-center transition-all`}>
                <span style={{ color: '#fff' }}>
                  {t.t(
                    lang,
                    (s) =>
                      s.components.flowForm.submitValidation.submitButton.submit
                        .label[`${isValid}`]
                  )}
                </span>
                {isValid && !isInactive && (
                  <C.ButtonSubmit
                    color="primary_light"
                    text={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.submitValidation.submitButton
                          .submit.button
                    )}
                    displayLoading={submitLoading}
                  />
                )}
                {isValid && isPending && (
                  <C.ButtonSubmit
                    color="primary_light"
                    text={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.submitValidation.submitButton
                          .saveAndApprove.button
                    )}
                    displayLoading={submitLoading}
                  />
                )}
                {isPending && (
                  <C.Button
                    onClick={async () => {
                      handleSubmit(values as FlowFormTypeValidated, true);
                    }}
                    color="primary_light"
                    text={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.submitValidation.submitButton.save
                          .button
                    )}
                    displayLoading={submitLoading}
                  />
                )}
                {isInactive && !isPending && (
                  <C.Button
                    onClick={async () => {
                      handleSubmit({
                        ...values,
                        isInactive: false,
                      } as FlowFormTypeValidated);
                    }}
                    color="primary_light"
                    text={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.submitValidation.submitButton
                          .reactivate.button
                    )}
                    displayLoading={submitLoading}
                  />
                )}
              </Box>
            </Snackbar>
          )}
        </Form>
      )}
    </Formik>
  );
};
