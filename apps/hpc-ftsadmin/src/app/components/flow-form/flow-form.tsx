import {
  Box,
  Grow,
  Paper,
  Snackbar,
  type SxProps,
  type Theme,
  useTheme,
} from '@mui/material';
import {
  type categories,
  errors,
  type flows,
  type governingEntities,
  type locations,
  type organizations,
  type usageYears,
  util,
} from '@unocha/hpc-data';
import { C } from '@unocha/hpc-ui';
import type { Dayjs } from 'dayjs';
import { Form, Formik, type FormikHelpers } from 'formik';
import * as io from 'io-ts';
import React, { useState } from 'react';
import { FaTrashAlt, FaUserSecret } from 'react-icons/fa';
import { MdAdd, MdCheck, MdClose, MdOutlineSearch } from 'react-icons/md';
import { Link, useBeforeUnload, useBlocker, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../../i18n';
import { getContext } from '../../context';
import paths from '../../paths';
import { TOAST_CONFIG, TOAST_CONFIG_ERROR } from '../../utils/constants';
import {
  autofillEmergencies,
  autofillFieldClusters,
  autofillGlobalClusters,
  autofillOrganizations,
  autofillPlan,
  autofillProject,
  autofillUsageYears,
} from '../../utils/fn-autofills';
import {
  fnCategories,
  fnCurrencies,
  fnEmergencies,
  fnGlobalClusters,
  fnGoverningEntities,
  fnLocations,
  fnOrganizations,
  fnPlans,
  fnProjects,
  fnUsageYears,
  usageYearFirstViewCondition,
} from '../../utils/fn-promises';
import {
  validateFlow,
  validateFlowIsUnlinked,
} from '../../utils/fn-validations';
import validateForm from '../../utils/form-validation';
import {
  currencyToInteger,
  integerToCurrency,
  valueToInteger,
} from '../../utils/map-functions';
import {
  CTP,
  type RefDirection,
  isMethodOption,
  parseFlowForm,
  pendingValuesFlowForm,
  queryParamsFlowFilter,
  serializeFlowForm,
} from '../../utils/parse-flow-form';
import ReportingDetail, {
  REPORTING_DETAIL_INITIAL_VALUES,
  type ReportingDetailProps,
  validateReportingDetailsRequiredField,
  validateReportingDetailsURLFormat,
} from '../reporting-detail';
import FlowLink, { type FlowLinkProps } from './flow-link';
import FlowLinkWarning from './flow-link-warning';
import FlowPreviousReportingDetails from './flow-previous-reporting-details';
import FlowSearch, { OVERRIDING_FLOW_KEYS } from './flow-search';
import FlowVersions from './flow-version';
import FormGroupReadOnly from './form-group-readonly';
import AsyncAutocompleteSelectReview from './inputs/async-autocomplete-pending-review';
import AutocompleteSelectReview from './inputs/autocomplete-pending-review';
import DatePickerReview from './inputs/date-picker-pending-review';
import NumberFieldReview from './inputs/number-field-pending-review';
import TextFieldReview from './inputs/text-field-pending-review';

type FlowFormProps = {
  load: () => void;
  inactiveReasons: categories.GetCategoriesResult;
  flowType: util.FormObjectValue[];
  contributionType: util.FormObjectValue[];
  method: util.FormObjectValue[];
  flowStatus: util.FormObjectValue[];
  earmarkingType: util.FormObjectValue[];
  initialValues?: FlowFormType;
  flow?: flows.GetFlowResult;
  isPending?: boolean;
  isInactive?: boolean;
};

export type FlowFormType = {
  fundingSourceOrganizations: util.FormObjectValue[];
  fundingSourceUsageYears: util.FormObjectValue[];
  fundingSourceLocations: util.FormObjectValue[];
  fundingSourceEmergencies: util.FormObjectValue[];
  fundingSourceGlobalClusters: util.FormObjectValue[];
  fundingSourceFieldClusters: util.FormObjectValue[];
  fundingSourceProject: util.FormObjectValue | null;
  fundingSourcePlan: util.FormObjectValue | null;

  fundingDestinationOrganizations: util.FormObjectValue[];
  fundingDestinationAnonymizedOrganizations: util.FormObjectValue[];
  fundingDestinationUsageYears: util.FormObjectValue[];
  fundingDestinationLocations: util.FormObjectValue[];
  fundingDestinationEmergencies: util.FormObjectValue[];
  fundingDestinationGlobalClusters: util.FormObjectValue[];
  fundingDestinationFieldClusters: util.FormObjectValue[];
  fundingDestinationProject: util.FormObjectValue | null;
  fundingDestinationPlan: util.FormObjectValue | null;

  isNewMoney: boolean;
  amountUSD: string;
  amountOriginalCurrency: string;
  currency: util.FormObjectValue | null;
  exchangeRate: string;
  flowDescription: string;
  firstReported: Dayjs | null;
  decisionDate: Dayjs | null;
  donorBudgetYear: string;
  flowType: util.FormObjectValue | null;
  flowStatus: util.FormObjectValue | null;
  flowDate: Dayjs | null;
  contributionType: util.FormObjectValue | null;
  earmarkingType: util.FormObjectValue | null;
  method: util.FormObjectValue | null;
  childMethod: util.FormObjectValue | null;
  keywords: util.FormObjectValue[];
  beneficiaryGroup: util.FormObjectValue | null;
  notes: string;

  parentFlow: FlowLinkProps | null;
  childFlows: FlowLinkProps[];

  reportingDetails: ReportingDetailProps[];

  isRestricted: boolean;
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
  organizations: Array<
    {
      refDirection: RefDirection;
      options: Array<
        Pick<organizations.Organization, 'id' | 'name' | 'abbreviation'>
      >;
    } & organizations.Organization
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
/**
 * 3.75rem equals to:
 *  - `p-6` / 2 from `FormGroupPaper`
 *  - `gap-x-6` from parent container
 *  - `mx-6` from parent parent container
 */
const SOURCE_DESTINATION_MAX_WIDTH = 'max-w-[calc(50%-3.75rem)]';
const AddReportingDetailButton = tw(C.Button)`
  flex
  justify-center
`;

const RestrictedSpan = tw.span`
  font-normal
  text-unocha-secondary
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
  fundingDestinationAnonymizedOrganizations: [],
  fundingDestinationUsageYears: [],
  fundingDestinationLocations: [],
  fundingDestinationEmergencies: [],
  fundingDestinationGlobalClusters: [],
  fundingDestinationFieldClusters: [],
  fundingDestinationProject: null,
  fundingDestinationPlan: null,

  isNewMoney: false,
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
  childMethod: null,
  keywords: [],
  beneficiaryGroup: null,
  notes: '',

  parentFlow: null,
  childFlows: [],

  reportingDetails: [REPORTING_DETAIL_INITIAL_VALUES],

  isRestricted: false,
  isErrorCorrection: false,
  isInactive: false,
};

const FLOW_FORM_VALIDATION_KEYS = [
  'amountUSD',
  'amountOriginalCurrency',
  'donorBudgetYear',
  'exchangeRate',
  'flowType',
  'flowStatus',
  'flowDescription',
  'firstReported',
  'flowDate',
  'fundingSourceUsageYears',
  'fundingDestinationUsageYears',
] as const;
export type FlowFormValidationKeys = (typeof FLOW_FORM_VALIDATION_KEYS)[number];

const FORM_VALIDATION_SCHEMA: io.TypeC<
  Record<FlowFormValidationKeys, io.Mixed>
> = io.type({
  amountUSD: util.CURRENCY_INTEGER_FROM_STRING,
  amountOriginalCurrency: io.union([
    util.EMPTY_STRING,
    util.CURRENCY_INTEGER_FROM_STRING,
  ]),
  donorBudgetYear: io.union([util.EMPTY_STRING, util.YEAR_FROM_STRING]),
  exchangeRate: io.union([util.EMPTY_STRING, util.POSITIVE_NUMBER_FROM_STRING]),
  flowType: util.NON_NULL_VALUE,
  flowStatus: util.NON_NULL_VALUE,
  flowDescription: util.NON_EMPTY_STRING,
  firstReported: util.VALID_DAYJS_DATE,
  flowDate: util.VALID_DAYJS_DATE,
  fundingSourceUsageYears: util.NON_EMPTY_ARRAY,
  fundingDestinationUsageYears: util.NON_EMPTY_ARRAY,
});

const validationErrorMessages = (
  lang: LanguageKey
): Record<FlowFormValidationKeys, string> => {
  const messageMap = FLOW_FORM_VALIDATION_KEYS.reduce(
    (recordMap, currentField) => {
      recordMap[currentField] = t.t(
        lang,
        (s) => s.components.flowForm.codecValidation[currentField]
      );
      return recordMap;
    },
    {} as Record<FlowFormValidationKeys, string>
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
  const { lang } = getContext();
  return (
    <FormGroupPaper elevation={3} sx={styles}>
      <Box sx={tw`flex items-center justify-between`}>
        <h2>{title}</h2>
        {closeButtonAction && (
          <MdClose
            onClick={closeButtonAction}
            style={{ cursor: 'pointer', fontSize: '25px' }}
          />
        )}
      </Box>
      {children}
      {closeButtonAction && (
        <Box sx={tw`pt-4 flex justify-end`}>
          <C.Button
            color="secondary"
            onClick={closeButtonAction}
            text={t.t(lang, (s) => s.components.reportingDetail.removeButton)}
          />
        </Box>
      )}
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

  if (disabled) {
    return;
  }
  const amountUSDInt = currencyToInteger(amountUSD);
  const amountOriginalCurrencyInt = currencyToInteger(amountOriginalCurrency);
  const exchangeRateFloat = parseFloat(exchangeRate);

  if (amountUSDInt && !amountOriginalCurrencyInt && exchangeRateFloat) {
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
  const buttonProps = {
    onClick: () =>
      setFieldValue('exchangeRate', amountOriginalCurrencyInt / amountUSDInt),
    text: t.t(lang, (s) => s.components.flowAmountButton.exchangeRate),
  };
  return <C.Button color="primary" {...buttonProps} className="text-end" />;
};

const BlockNavigationOnUnsavedChanges = ({
  dirty,
  submitLoading,
  rejectLoading,
  deleteLoading,
}: {
  dirty: boolean;
  submitLoading: boolean;
  rejectLoading: boolean;
  deleteLoading: boolean;
}) => {
  const { lang } = getContext();
  const message = t.t(lang, (s) => s.components.flowForm.blockNavigation);
  const isSubmitting = submitLoading || rejectLoading || deleteLoading;
  //  User reloading or closing tab
  useBeforeUnload((event) => {
    if (dirty && !isSubmitting) {
      event.preventDefault();
      //  Message will not always show ours, depends on browser
      return message;
    }
  });

  //  User navigating away
  useBlocker(() => {
    if (dirty && !isSubmitting) {
      return !globalThis.confirm(message);
    }
    return false;
  });

  return null;
};

export const FlowForm = (props: FlowFormProps) => {
  const { env: getEnv, lang } = getContext();
  const env = getEnv();
  const navigate = useNavigate();
  const dir = useTheme().direction;
  const {
    load,
    initialValues,
    flow,
    isPending,
    isInactive,
    inactiveReasons,
    flowType,
    contributionType,
    method,
    earmarkingType,
    flowStatus,
  } = props;

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [shouldRejectLoading, setShouldRejectLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [shouldAcceptAllPendingChanges, setShouldAcceptAllPendingChanges] =
    useState(false);
  const [pendingValuesHandled, setPendingValuesHandled] = useState(0);

  const [pendingValues, setPendingValues] = useState(
    isPending ? pendingValuesFlowForm(initialValues, flow) : undefined
  );

  const isDisabled = isInactive && !isPending;
  const isDeleted = !!flow?.deletedAt;

  const [methodOptions, childMethodOptions] = method.reduce(
    (acc, value) => {
      acc[isMethodOption(value) ? 0 : 1].push(value);
      return acc;
    },
    [[], []] as [util.FormObjectValue[], util.FormObjectValue[]]
  );

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

  const getChildFlowsAmountUSDDiff = (
    values: FlowFormType,
    shouldExcludeRestricted?: boolean
  ) => {
    const { amountUSD, childFlows } = values;
    if (!amountUSD) {
      return null;
    }

    const filteredChildFlows = shouldExcludeRestricted
      ? childFlows.filter((childFlow) => !childFlow.restricted)
      : childFlows;

    const amountUSDDifference = integerToCurrency(
      currencyToInteger(amountUSD) -
        filteredChildFlows.reduce(
          (acc, cur) => acc + valueToInteger(cur.amountUSD),
          0
        )
    );
    return `US$ ${amountUSDDifference}`;
  };

  const getChildFlowsOriginalAmountDiff = (
    values: FlowFormType,
    shouldExcludeRestricted?: boolean
  ) => {
    const { amountOriginalCurrency, currency, childFlows } = values;
    if (!amountOriginalCurrency || !currency) {
      return null;
    }

    const filteredChildFlows = shouldExcludeRestricted
      ? childFlows.filter((childFlow) => !childFlow.restricted)
      : childFlows;

    const originalAmountDifference = integerToCurrency(
      currencyToInteger(amountOriginalCurrency) -
        filteredChildFlows.reduce((acc, cur) => {
          if (!cur.amountOriginalCurrency) {
            return acc;
          }
          return acc + valueToInteger(cur.amountOriginalCurrency);
        }, 0)
    );
    return `${currency.displayLabel} ${originalAmountDifference}`;
  };

  const isUsageYearValues = (
    value: ConsistencyErrorReasons[keyof ConsistencyErrorReasons][number],
    type: keyof ConsistencyErrorReasons
  ): value is ConsistencyErrorReasons['usageYears'][number] =>
    type === 'usageYears';
  const isDataConsistencyErrorMap = (
    reason: errors.DataConsistencyErrorReason[number]
  ): reason is ConsistencyErrorReasonMap => {
    const KEYS = new Set<string>([
      'usageYears',
      'locations',
      'governingEntities',
      'organizations',
    ] satisfies Array<keyof ConsistencyErrorReasons>);
    return KEYS.has(reason.type);
  };

  const handleEarmarkingRestriction = (parentValues: FlowLinkProps | null) => {
    if (!parentValues?.earmarking) {
      return earmarkingType;
    }
    /**
     * Ordered based on https://fts.unocha.org/glossary
     */
    const EARMARKING_FREEDOM = [
      'Unearmarked',
      'Softly earmarked',
      'Earmarked',
      'Tightly earmarked',
    ] as const;

    const isParentEarmarking = (
      earmarking: string
    ): earmarking is (typeof EARMARKING_FREEDOM)[number] =>
      new Set<string>(EARMARKING_FREEDOM).has(earmarking);

    const parentEarmarking = parentValues.earmarking.name;
    if (!isParentEarmarking(parentEarmarking)) {
      return earmarkingType;
    }

    const index = EARMARKING_FREEDOM.indexOf(parentEarmarking);
    const allowedChildEarmarking = new Set<string>(
      EARMARKING_FREEDOM.slice(index)
    );

    return earmarkingType.filter((e) =>
      allowedChildEarmarking.has(e.displayLabel)
    );
  };
  const handleDataConsistencyError = (err: errors.DataConsistencyError) => {
    const message = err.reason.map((r) => {
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
    });

    return message;
  };
  function isCustomError(err: unknown): err is { json: { message: string } } {
    const errorHasJson = err && typeof err === 'object' && 'json' in err;
    if (!errorHasJson) {
      return false;
    }
    const json = err.json;
    const jsonHasMessage =
      json && typeof json === 'object' && 'message' in json;

    if (!jsonHasMessage) {
      return false;
    }

    return 'message' in json && typeof json.message === 'string';
  }
  const handleSubmitError = (err: Error) => {
    if (errors.isDataConsistencyError(err)) {
      for (const reason of handleDataConsistencyError(err)) {
        toast.error(reason, TOAST_CONFIG_ERROR);
      }
    } else {
      toast.error(
        isCustomError(err)
          ? err.json.message
          : t.t(
              lang,
              (s) => s.components.flowForm.submitValidation.unknownError
            ),
        TOAST_CONFIG_ERROR
      );
    }
  };
  const handleSubmit = async (
    values: FlowFormTypeValidated,
    isSaved?: boolean
  ) => {
    toast.dismiss();
    setIsSubmitLoading(true);
    const isValidFlow = await validateFlow({
      env,
      lang,
      pendingValuesHandled,
      values,
      isPending,
      pendingValues,
    });
    if (!isValidFlow) {
      setIsSubmitLoading(false);
      return;
    }
    if (flow?.id) {
      if (!isPending && values.isInactive && !validateFlowIsUnlinked(values)) {
        toast.error(
          t.t(
            lang,
            (s) => s.components.flowForm.submitValidation.deleteLinkedFlows
          ),
          TOAST_CONFIG_ERROR
        );
        setIsSubmitLoading(false);
        return;
      }
      env.model.flows
        .updateFlow({
          flow: {
            ...parseFlowForm(values, inactiveReasons, flowType, initialValues, {
              isApproved: isPending && !isSaved,
              isSaved,
            }).flow,
            id: flow.id,
            versionID: flow.versionID,
          },
        })
        .then((updatedFlow) => {
          toast.success(
            t.t(
              lang,
              (s) => s.components.flowForm.submitValidation.updateSuccess
            ),
            TOAST_CONFIG
          );
          if (values.isErrorCorrection || isPending) {
            load();
            return;
          }
          navigate(paths.flow(updatedFlow.id, updatedFlow.versionID));
        })
        .catch((error) => {
          handleSubmitError(error);
        })
        .finally(() => setIsSubmitLoading(false));
    } else {
      env.model.flows
        .createFlow(
          parseFlowForm(values, inactiveReasons, flowType, initialValues)
        )
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
        .catch((error) => {
          handleSubmitError(error);
        })
        .finally(() => setIsSubmitLoading(false));
    }
  };
  const handleChangeFirstReported = (
    newValue: Dayjs | null,
    setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'],
    values: FlowFormType
  ) => {
    if (newValue !== null && !newValue.isValid()) {
      setFieldValue('firstReported', newValue);
      return;
    }
    const newReportingDetails = values.reportingDetails.map(
      (reportingDetail) =>
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
    toast.dismiss();
    setIsDeleteLoading(true);
    if (
      !globalThis.confirm(
        t.t(
          lang,
          (s) => s.components.flowForm.submitValidation.deleteFlowWarning
        )
      )
    ) {
      setIsDeleteLoading(false);
      return;
    }
    if (!validateFlowIsUnlinked(values) || !flow) {
      toast.error(
        t.t(
          lang,
          (s) => s.components.flowForm.submitValidation.deleteLinkedFlows
        ),
        TOAST_CONFIG_ERROR
      );
      setIsDeleteLoading(false);
      return;
    }
    await env.model.flows
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
      .catch((error) => {
        toast.error(
          isCustomError(error)
            ? error.json.message
            : t.t(
                lang,
                (s) => s.components.flowForm.submitValidation.unknownError
              ),
          TOAST_CONFIG_ERROR
        );
      })
      .finally(() => setIsDeleteLoading(false));
  };

  const handleRejectFlow = async (values: FlowFormType) => {
    toast.dismiss();
    setShouldRejectLoading(true);
    if (!flow) {
      setShouldRejectLoading(false);
      return;
    }
    if (
      !globalThis.confirm(
        t.t(lang, (s) => s.components.flowForm.rejectFlow.confirm)
      )
    ) {
      setShouldRejectLoading(false);
      return;
    }
    const rejected = inactiveReasons.find(
      (category) => category.name === 'Rejected'
    );

    if (!rejected) {
      toast.error(
        t.t(lang, (s) => s.components.flowForm.rejectFlow.categoryNotFound),
        TOAST_CONFIG_ERROR
      );
      return;
    }

    const newFlow = parseFlowForm(
      values as FlowFormTypeValidated,
      inactiveReasons,
      flowType,
      initialValues,
      {
        isApproved: isPending,
      }
    ).flow;

    await env.model.flows
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
        toast.success(
          t.t(
            lang,
            (s) => s.components.flowForm.submitValidation.rejectSuccess
          ),
          TOAST_CONFIG
        );
        load();
      })
      .catch((error) => {
        toast.error(
          isCustomError(error)
            ? error.json.message
            : t.t(
                lang,
                (s) => s.components.flowForm.submitValidation.unknownError
              ),
          TOAST_CONFIG_ERROR
        );
      })
      .finally(() => setShouldRejectLoading(false));
  };
  const handleApproveAll = () => {
    setShouldAcceptAllPendingChanges(true);
  };

  const handleRejectAll = () => {
    setPendingValues(null);
    setPendingValuesHandled(0);
  };

  const handleFundingDestinationOrganizations = (
    newValue:
      | NonNullable<string | util.FormObjectValue>
      | Array<string | util.FormObjectValue>
      | null,
    setFieldValue: FormikHelpers<FlowFormType>['setFieldValue']
  ) => {
    const isFormObjectValueArray = (
      val: Array<string | util.FormObjectValue>
    ): val is util.FormObjectValue[] =>
      !val.some((val) => typeof val === 'string');

    setFieldValue('fundingDestinationOrganizations', newValue);
    if (!Array.isArray(newValue) || !isFormObjectValueArray(newValue)) {
      return;
    }

    if (!newValue.some((org) => org.isConfidential)) {
      setFieldValue('fundingDestinationAnonymizedOrganizations', []);
    }
  };

  const handleMethod = (
    newValue:
      | NonNullable<string | util.FormObjectValue>
      | Array<string | util.FormObjectValue>
      | null,
    setFieldValue: FormikHelpers<FlowFormType>['setFieldValue']
  ) => {
    setFieldValue('method', newValue);

    //  ChildMethod is `FormObjectValue`
    if (Array.isArray(newValue) || typeof newValue === 'string') {
      return;
    }

    setFieldValue('childMethod', null);
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
      {({ values, isValid: formikValid, setFieldValue, dirty }) => {
        const isValid =
          formikValid &&
          values.reportingDetails.reduce(
            (acc, { reportedByOrganization, reportChannel, url }) =>
              acc &&
              !validateReportingDetailsRequiredField(
                reportedByOrganization,
                lang
              ) &&
              !validateReportingDetailsRequiredField(reportChannel, lang) &&
              !validateReportingDetailsURLFormat(url, lang),
            true
          );
        return (
          <Form>
            <BlockNavigationOnUnsavedChanges
              {...{
                dirty,
                submitLoading: isSubmitLoading,
                rejectLoading: shouldRejectLoading,
                deleteLoading: isDeleteLoading,
              }}
            />
            {!isDisabled && (
              <C.CheckBox
                name="restricted"
                label={t.t(
                  lang,
                  (s) => s.components.flowForm.fields.restricted
                )}
              />
            )}
            {initialValues && flow && !isDeleted && (
              <Box sx={tw`flex justify-between`}>
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
                      flowFormCopyValuesPath: paths.flow(
                        flow.id,
                        flow.versionID
                      ),
                    }}
                  >
                    {t.t(lang, (s) => s.components.flowForm.copyFlow)}
                  </Link>
                  <C.Button
                    color="primary"
                    onClick={() => {
                      handleSearchSimilarFlows(initialValues);
                    }}
                    text={t.t(
                      lang,
                      (s) => s.components.flowForm.searchSimilarFlow
                    )}
                    startIcon={MdOutlineSearch}
                  />
                  <C.Button
                    color="secondary"
                    onClick={() => handleDeleteFlow(values)}
                    text={t.t(lang, (s) => s.components.flowForm.deleteFlow)}
                    shouldDisplayLoading={isDeleteLoading}
                    startIcon={FaTrashAlt}
                  />
                </Box>
                {isPending && (
                  <Box sx={tw`flex gap-x-4 items-center justify-end`}>
                    <C.Button
                      color="secondary"
                      onClick={() => handleRejectFlow(values)}
                      text={t.t(
                        lang,
                        (s) => s.components.flowForm.rejectFlow.button
                      )}
                      shouldDisplayLoading={shouldRejectLoading}
                      startIcon={MdClose}
                    />
                    <Box
                      sx={tw`flex bg-unocha-primary p-3 ms-4 rounded-sm gap-x-4`}
                    >
                      <C.Button
                        color="primary_light"
                        onClick={handleApproveAll}
                        text={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.submitValidation
                              .acceptAllPendingChanges
                        )}
                        startIcon={MdCheck}
                      />
                      <C.Button
                        color="secondary_light"
                        onClick={handleRejectAll}
                        text={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.submitValidation
                              .rejectAllPendingChanges
                        )}
                        shouldDisplayLoading={shouldRejectLoading}
                        startIcon={MdClose}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            <Box sx={tw`mt-6 mx-6 flex flex-col gap-y-4`}>
              <Box sx={tw`flex gap-x-6`}>
                <FormGroup
                  title={t.t(
                    lang,
                    (s) => s.components.flowForm.sectionTitles.sourceFlow
                  )}
                  styles={tw`basis-1/2 ${SOURCE_DESTINATION_MAX_WIDTH}`}
                >
                  {values.parentFlow ? (
                    <>
                      <FlowLinkWarning
                        text={t.t(
                          lang,
                          (s) => s.components.flowForm.warning.sourceFlow
                        )}
                        link={{ ...values.parentFlow }}
                      />
                      <FormGroupReadOnly
                        fields={OVERRIDING_FLOW_KEYS}
                        values={values}
                      />
                    </>
                  ) : (
                    <>
                      <AsyncAutocompleteSelectReview
                        fieldName="fundingSourceOrganizations"
                        label={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.fields
                              .fundingSourceOrganizations
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
                        disabled={isDisabled}
                        pendingValues={
                          pendingValues?.fundingSourceOrganizations
                        }
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                        isMulti
                      />
                      <AsyncAutocompleteSelectReview
                        fieldName="fundingSourceUsageYears"
                        label={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.fields.fundingSourceUsageYears
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
                        disabled={isDisabled}
                        pendingValues={pendingValues?.fundingSourceUsageYears}
                        firstViewCondition={usageYearFirstViewCondition}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                        isMulti
                        required
                      />
                      <AsyncAutocompleteSelectReview
                        fieldName="fundingSourceLocations"
                        label={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.fields.fundingSourceLocations
                        )}
                        fnPromise={(query) => fnLocations(query, env)}
                        setPendingValuesHandled={setPendingValuesHandled}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.fundingSourceLocations}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                        isMulti
                      />
                      <AsyncAutocompleteSelectReview
                        fieldName="fundingSourceGlobalClusters"
                        label={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.fields
                              .fundingSourceGlobalClusters
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
                        disabled={isDisabled}
                        pendingValues={
                          pendingValues?.fundingSourceGlobalClusters
                        }
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                        disabled={isDisabled}
                        pendingValues={pendingValues?.fundingSourcePlan}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                      />
                      <AsyncAutocompleteSelectReview
                        fieldName="fundingSourceFieldClusters"
                        label={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.fields
                              .fundingSourceFieldClusters
                        )}
                        fnPromise={() =>
                          values.fundingSourcePlan?.value
                            ? fnGoverningEntities(
                                env,
                                valueToInteger(values.fundingSourcePlan.value)
                              )
                            : new Promise<util.FormObjectValue[]>((resolve) =>
                                resolve([])
                              )
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
                        disabled={
                          !!isDisabled || values.fundingSourcePlan === null
                        }
                        isAutocompleteAPI={false}
                        pendingValues={
                          pendingValues?.fundingSourceFieldClusters
                        }
                        observedValue={values.fundingSourcePlan?.value.toString()}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                        isMulti
                      />
                      <AsyncAutocompleteSelectReview
                        fieldName="fundingSourceEmergencies"
                        label={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.fields
                              .fundingSourceEmergencies
                        )}
                        fnPromise={(query) => fnEmergencies(query, env)}
                        setPendingValuesHandled={setPendingValuesHandled}
                        onChange={(newValue) => {
                          autofillEmergencies({
                            fieldName: 'fundingSourceEmergencies',
                            setFieldValue,
                            values,
                            env,
                            newValue,
                          });
                        }}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.fundingSourceEmergencies}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                        isMulti
                      />
                      <AsyncAutocompleteSelectReview
                        fieldName="fundingSourceProject"
                        label={t.t(
                          lang,
                          (s) =>
                            s.components.flowForm.fields.fundingSourceProject
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
                        disabled={isDisabled}
                        pendingValues={pendingValues?.fundingSourceProject}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                      />
                    </>
                  )}
                </FormGroup>
                <FormGroup
                  title={t.t(
                    lang,
                    (s) => s.components.flowForm.sectionTitles.destinationFlow
                  )}
                  styles={tw`basis-1/2 ${SOURCE_DESTINATION_MAX_WIDTH}`}
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
                        s.components.flowForm.fields
                          .fundingDestinationOrganizations
                    )}
                    fnPromise={(query) => fnOrganizations(query, env)}
                    setPendingValuesHandled={setPendingValuesHandled}
                    disabled={isDisabled}
                    onChange={(newValue) =>
                      handleFundingDestinationOrganizations(
                        newValue,
                        setFieldValue
                      )
                    }
                    pendingValues={
                      pendingValues?.fundingDestinationOrganizations
                    }
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
                    isMulti
                  />
                  {values.fundingDestinationOrganizations.some(
                    (org) => org.isConfidential
                  ) && (
                    <AsyncAutocompleteSelectReview
                      fieldName="fundingDestinationAnonymizedOrganizations"
                      label={
                        <Box sx={tw`flex items-center gap-x-4`}>
                          <FaUserSecret />
                          {t.t(
                            lang,
                            (s) =>
                              s.components.flowForm.fields
                                .fundingDestinationAnonymizedOrganizations
                          )}
                        </Box>
                      }
                      fnPromise={(query) => fnOrganizations(query, env)}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={
                        pendingValues?.fundingDestinationAnonymizedOrganizations
                      }
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
                      isMulti
                    />
                  )}
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationUsageYears"
                    label={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.fields
                          .fundingDestinationUsageYears
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
                    firstViewCondition={usageYearFirstViewCondition}
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                    pendingValues={
                      pendingValues?.fundingDestinationGlobalClusters
                    }
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationFieldClusters"
                    label={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.fields
                          .fundingDestinationFieldClusters
                    )}
                    fnPromise={() =>
                      values.fundingDestinationPlan?.value
                        ? fnGoverningEntities(
                            env,
                            valueToInteger(values.fundingDestinationPlan.value)
                          )
                        : new Promise<util.FormObjectValue[]>((resolve) =>
                            resolve([])
                          )
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
                    disabled={
                      !!isDisabled || values.fundingDestinationPlan === null
                    }
                    isAutocompleteAPI={false}
                    pendingValues={
                      pendingValues?.fundingDestinationFieldClusters
                    }
                    isMulti
                    observedValue={values.fundingDestinationPlan?.value.toString()}
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationEmergencies"
                    label={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.fields
                          .fundingDestinationEmergencies
                    )}
                    fnPromise={(query) => fnEmergencies(query, env)}
                    setPendingValuesHandled={setPendingValuesHandled}
                    onChange={(newValue) => {
                      autofillEmergencies({
                        fieldName: 'fundingDestinationEmergencies',
                        setFieldValue,
                        values,
                        env,
                        newValue,
                      });
                    }}
                    disabled={isDisabled}
                    pendingValues={pendingValues?.fundingDestinationEmergencies}
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationProject"
                    label={t.t(
                      lang,
                      (s) =>
                        s.components.flowForm.fields.fundingDestinationProject
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
                    shouldAcceptChange={shouldAcceptAllPendingChanges}
                  />
                </FormGroup>
              </Box>

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
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
                      allowNegative
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
                          shouldAcceptChange={shouldAcceptAllPendingChanges}
                          allowNegative
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
                          shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
                    />
                    <Box sx={tw`flex gap-4`}>
                      <DatePickerReview
                        sx={tw`flex-grow`}
                        label={t.t(
                          lang,
                          (s) => s.components.flowForm.fields.firstReported
                        )}
                        fieldName="firstReported"
                        controlledField={{
                          value: values.firstReported,
                          onChange: (value) =>
                            handleChangeFirstReported(
                              value,
                              setFieldValue,
                              values
                            ),
                        }}
                        setPendingValuesHandled={setPendingValuesHandled}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.firstReported}
                        lang={lang}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                        required
                      />
                      <DatePickerReview
                        sx={tw`flex-grow`}
                        label={t.t(
                          lang,
                          (s) => s.components.flowForm.fields.decisionDate
                        )}
                        fieldName="decisionDate"
                        setPendingValuesHandled={setPendingValuesHandled}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.decisionDate}
                        lang={lang}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                      />
                    </Box>
                    <NumberFieldReview
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.donorBudgetYear
                      )}
                      fieldName="donorBudgetYear"
                      type="integer"
                      placeholder="YYYY"
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.donorBudgetYear}
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
                      required
                    />
                    <AutocompleteSelectReview
                      fieldName="flowStatus"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.flowStatus
                      )}
                      options={flowStatus}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.flowStatus}
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                      lang={lang}
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
                    />
                    <AutocompleteSelectReview
                      fieldName="earmarkingType"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.earmarkingType
                      )}
                      options={handleEarmarkingRestriction(values.parentFlow)}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.earmarkingType}
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
                    />
                    <AutocompleteSelectReview
                      fieldName="method"
                      label={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.method
                      )}
                      options={methodOptions}
                      setPendingValuesHandled={setPendingValuesHandled}
                      disabled={isDisabled}
                      pendingValues={pendingValues?.method}
                      onChange={(newValue) =>
                        handleMethod(newValue, setFieldValue)
                      }
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
                      required
                    />
                    {values.method?.displayLabel === CTP && (
                      <AutocompleteSelectReview
                        fieldName="childMethod"
                        label={t.t(
                          lang,
                          (s) => s.components.flowForm.fields.childMethod
                        )}
                        options={childMethodOptions}
                        setPendingValuesHandled={setPendingValuesHandled}
                        disabled={isDisabled}
                        pendingValues={pendingValues?.childMethod}
                        shouldAcceptChange={shouldAcceptAllPendingChanges}
                      />
                    )}

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
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                      shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                  shouldAcceptChange={shouldAcceptAllPendingChanges}
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
                    <h3>
                      {t.t(lang, (s) => s.components.flowLink.parentFlow)}
                    </h3>
                    <FlowLink
                      flowLink={values.parentFlow}
                      fieldName="parentFlow"
                      disabled={isDisabled}
                    />
                  </Box>
                )}

                {values.childFlows.length > 0 && (
                  <Box sx={tw`mb-4`}>
                    <h3>
                      {t.t(lang, (s) => s.components.flowLink.childFlows)}
                    </h3>
                    <Box sx={tw`flex flex-col gap-y-4 my-4`}>
                      {values.childFlows.map((childFlow) => (
                        <div key={childFlow.id}>
                          <FlowLink
                            flowLink={childFlow}
                            fieldName="childFlows"
                            disabled={isDisabled}
                          />
                        </div>
                      ))}
                    </Box>
                    <Box sx={tw`text-end mb-6 w-fit float-end flex gap-x-12`}>
                      <Box sx={tw`flex flex-col justify-end`}>
                        <span />
                        <span>
                          {t.t(
                            lang,
                            (s) =>
                              s.components.flowForm.remainingAmount
                                .remainingAmount
                          )}
                        </span>
                        {values.amountOriginalCurrency && (
                          <span>
                            {t.t(
                              lang,
                              (s) =>
                                s.components.flowForm.remainingAmount
                                  .remainingOrigAmount
                            )}
                          </span>
                        )}
                      </Box>
                      <Box sx={tw`flex flex-col justify-end font-bold`}>
                        <span />
                        <span>{getChildFlowsAmountUSDDiff(values)}</span>
                        <span>{getChildFlowsOriginalAmountDiff(values)}</span>
                      </Box>

                      <Box sx={tw`flex flex-col font-bold`}>
                        <RestrictedSpan>
                          {t.t(
                            lang,
                            (s) =>
                              s.components.flowForm.remainingAmount
                                .excludeRestricted
                          )}
                        </RestrictedSpan>
                        <span>{getChildFlowsAmountUSDDiff(values, true)}</span>
                        <span>
                          {getChildFlowsOriginalAmountDiff(values, true)}
                        </span>
                      </Box>
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
                        currentFlow={flow}
                      />
                    )}
                    <FlowSearch
                      name="childFlows"
                      text={t.t(
                        lang,
                        (s) => s.components.flowForm.fields.childFlows
                      )}
                      startIcon={MdAdd}
                      currentFlow={flow}
                    />
                  </Box>
                )}
              </FormGroup>
              {flow && flow.versions.length > 1 && (
                <FormGroup
                  title={t.t(
                    lang,
                    (s) => s.components.flowPreviousReportingDetails.title
                  )}
                >
                  <FlowPreviousReportingDetails flow={flow} />
                </FormGroup>
              )}
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
              {!isDeleted && !isDisabled && (
                <AddReportingDetailButton
                  startIcon={MdAdd}
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
              {flow?.versions && flow.versions.length > 0 && (
                <FormGroup
                  title={t.t(
                    lang,
                    (s) => s.components.flowForm.sectionTitles.flowVersion
                  )}
                >
                  <FlowVersions flow={flow} inactiveReasons={inactiveReasons} />
                </FormGroup>
              )}
            </Box>
            {!isDeleted && (
              <Snackbar
                open
                anchorOrigin={{
                  horizontal: dir === 'ltr' ? 'right' : 'left',
                  vertical: 'bottom',
                }}
                sx={tw`rounded-sm bg-unocha-primary`}
                TransitionComponent={Grow}
              >
                <Box
                  sx={tw`px-10 py-3 flex gap-x-4 items-center transition-all`}
                >
                  {(!isInactive || isPending) && (
                    <span style={{ color: '#fff' }}>
                      {t.t(
                        lang,
                        (s) =>
                          s.components.flowForm.submitValidation.submitButton
                            .submit.label[`${isValid}`]
                      )}
                    </span>
                  )}
                  {isValid && !isInactive && (
                    <C.ButtonSubmit
                      color="primary_light"
                      text={t.t(
                        lang,
                        (s) =>
                          s.components.flowForm.submitValidation.submitButton
                            .submit.button
                      )}
                      shouldDisplayLoading={isSubmitLoading}
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
                      shouldDisplayLoading={isSubmitLoading}
                    />
                  )}
                  {isPending && (
                    <C.Button
                      onClick={() => {
                        handleSubmit(values as FlowFormTypeValidated, true);
                      }}
                      color="primary_light"
                      text={t.t(
                        lang,
                        (s) =>
                          s.components.flowForm.submitValidation.submitButton
                            .save.button
                      )}
                      shouldDisplayLoading={isSubmitLoading}
                    />
                  )}
                  {isInactive && !isPending && (
                    <C.Button
                      onClick={() => {
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
                      shouldDisplayLoading={isSubmitLoading}
                    />
                  )}
                </Box>
              </Snackbar>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};
