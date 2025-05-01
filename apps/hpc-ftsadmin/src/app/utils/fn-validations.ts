import { flows, type FormObjectValue } from '@unocha/hpc-data';
import { toast } from 'react-toastify';
import { Environment } from '../../environments/interface';
import { type LanguageKey, t } from '../../i18n';
import type {
  FlowFormType,
  FlowFormTypeValidated,
} from '../components/flow-form/flow-form';
import { TOAST_CONFIG_ERROR } from './constants';
import { valueToInteger } from './map-functions';

const validateEarmarking = (
  values: FlowFormType,
  lang: LanguageKey
): string[] => {
  if (!values.earmarkingType) {
    return [
      t.t(lang, (s) => s.components.flowForm.submitValidation.earmarking),
    ];
  }
  return [];
};

const validateReportingOrganization = (
  values: FlowFormType,
  lang: LanguageKey
): string[] => {
  const reportingOrganizationIds = values.reportingDetails
    .map((rD) => {
      if (rD.reportedByOrganization?.value) {
        return valueToInteger(rD.reportedByOrganization?.value);
      }
      return undefined;
    })
    .filter((rD) => rD !== undefined) as number[];

  const fundingOrganizationIds = [
    ...values.fundingSourceOrganizations.map((sOrg) =>
      valueToInteger(sOrg.value)
    ),
    ...values.fundingDestinationOrganizations.map((dOrg) =>
      valueToInteger(dOrg.value)
    ),
  ];

  for (const reportingOrganizationId of reportingOrganizationIds) {
    if (!fundingOrganizationIds.includes(reportingOrganizationId)) {
      return [
        t.t(
          lang,
          (s) => s.components.flowForm.submitValidation.reportingOrganization
        ),
      ];
    }
  }
  return [];
};

const validateEmergency = async (
  values: FlowFormType,
  env: Environment,
  lang: LanguageKey
): Promise<string[]> => {
  const years = values.fundingDestinationUsageYears.map((usageYear) =>
    valueToInteger(usageYear.displayLabel)
  );
  const locations = values.fundingDestinationLocations.map((location) =>
    valueToInteger(location.value)
  );
  const emergencies = await env.model.emergencies.getEmergencies({
    years,
    locations,
  });
  if (emergencies.length > 0) {
    return [
      t.t(lang, (s) => s.components.flowForm.submitValidation.emergency, {
        emergency: emergencies[0].name,
      }),
    ];
  }
  return [];
};

const validateReportingDetails = (values: FlowFormType, lang: LanguageKey) => {
  const reportingDetails = values.reportingDetails;
  for (const reportingDetail of reportingDetails) {
    if (
      !reportingDetail.reportedByOrganization ||
      !reportingDetail.reportChannel
    ) {
      return t.t(
        lang,
        (s) =>
          s.components.flowForm.submitValidation.reportingDetails.requiredFields
      );
    }

    if (reportingDetail.file && !reportingDetail.reportFileTitle) {
      return t.t(
        lang,
        (s) => s.components.flowForm.submitValidation.reportingDetails.fileTitle
      );
    }

    if (reportingDetail.url && !reportingDetail.reportURLTitle) {
      return t.t(
        lang,
        (s) => s.components.flowForm.submitValidation.reportingDetails.urlTitle
      );
    }
  }
};

const validateParentFlowAmountUSD = (
  values: FlowFormType,
  lang: LanguageKey
): string[] => {
  const parentFlowAmountUSD = values.parentFlow?.amountUSD;
  const childFlowsSumAmountUSD = values.childFlows.reduce(
    (acc, childFlow) => acc + parseInt(childFlow.amountUSD),
    0
  );

  if (
    (parentFlowAmountUSD &&
      parseInt(parentFlowAmountUSD) < parseInt(values.amountUSD)) ||
    childFlowsSumAmountUSD > parseInt(values.amountUSD)
  ) {
    return [
      t.t(
        lang,
        (s) => s.components.flowForm.submitValidation.parentFlowAmountUSD
      ),
    ];
  }
  return [];
};

const validatePlan = async (
  plan: FormObjectValue | null,
  formLocations: FormObjectValue[],
  lang: LanguageKey,
  env: Environment,
  direction: 'source' | 'destination'
) => {
  if (!plan) {
    return [];
  }
  const planId = valueToInteger(plan.value);
  const { locations, planVersion } = await env.model.plans.getPlan({
    id: planId,
    scopes: ['locations', 'planVersion'],
  });
  const locationIds = locations.map((loc) => loc.id);
  const locationNames = locations.map((loc) => loc.name).join(', ');

  const hasValidLocation = formLocations.some((loc) =>
    locationIds.includes(valueToInteger(loc.value))
  );
  if (!hasValidLocation) {
    return [
      t.t(lang, (s) => s.components.flowForm.submitValidation.planLocation, {
        entity: t.t(
          lang,
          (s) => s.components.flowsFilter.filters[`${direction}Locations`]
        ),
        plan: planVersion.name,
        locations: locationNames,
      }),
    ];
  }
  return [];
};
const validatePlanLocation = async (
  values: FlowFormType,
  env: Environment,
  lang: LanguageKey
): Promise<string[]> => {
  if (!values.fundingDestinationPlan && !values.fundingSourcePlan) {
    return [];
  }
  return [
    ...(await validatePlan(
      values.fundingSourcePlan,
      values.fundingSourceLocations,
      lang,
      env,
      'source'
    )),
    ...(await validatePlan(
      values.fundingDestinationPlan,
      values.fundingDestinationLocations,
      lang,
      env,
      'destination'
    )),
  ];
};

const validateFlowForWarnings = async (
  values: FlowFormType,
  env: Environment,
  lang: LanguageKey
) => {
  const reportingDetailWarning = validateReportingDetails(values, lang);
  if (reportingDetailWarning) {
    toast.error(reportingDetailWarning, TOAST_CONFIG_ERROR);
    return false;
  }
  const planLocationValidation = await validatePlanLocation(values, env, lang);
  if (planLocationValidation.length) {
    for (const validation of planLocationValidation) {
      toast.error(validation, TOAST_CONFIG_ERROR);
    }
    return false;
  }

  const warnings: string[] = [
    ...validateEarmarking(values, lang),
    ...validateReportingOrganization(values, lang),
    ...validateParentFlowAmountUSD(values, lang),
    ...(await validateEmergency(values, env, lang)),
  ];

  for (const warning of warnings) {
    if (!window.confirm(warning)) {
      return false;
    }
  }

  return true;
};

export const validateFlowIsUnlinked = (flow: FlowFormType) => {
  if (!flow.parentFlow && flow.childFlows.length === 0) {
    return true;
  }
  return false;
};

export const validateFlow = async ({
  values,
  lang,
  env,
  pendingValuesHandled,
  pendingValues,
  isPending,
}: {
  values: FlowFormTypeValidated;
  lang: LanguageKey;
  env: Environment;
  pendingValuesHandled: number;
  pendingValues?: Partial<FlowFormType> | null;
  isPending?: boolean;
}) => {
  const {
    amountOriginalCurrency,
    currency,
    exchangeRate,
    parentFlow,
    childFlows,
  } = values;
  const isOriginalCurrencyNotFilled =
    (amountOriginalCurrency || currency || exchangeRate) &&
    (!amountOriginalCurrency || !currency || !exchangeRate);

  if (isOriginalCurrencyNotFilled) {
    toast.error(
      t.t(
        lang,
        (s) => s.components.flowForm.submitValidation.originalAmountNotFilled
      ),
      TOAST_CONFIG_ERROR
    );
    return false;
  }
  const isOriginalCurrencyDifferentToParent =
    parentFlow &&
    parentFlow.currency !== (values.currency?.displayLabel ?? null);

  const isOriginalCurrencyDifferentToChildren =
    childFlows.length &&
    childFlows?.some(
      (childFlow) =>
        childFlow.currency !== (values.currency?.displayLabel ?? null)
    );

  if (isOriginalCurrencyDifferentToParent) {
    toast.error(
      t.t(
        lang,
        (s) =>
          s.components.flowForm.submitValidation
            .originalAmountIsDifferentToParent
      ),
      TOAST_CONFIG_ERROR
    );
    return false;
  }
  if (isOriginalCurrencyDifferentToChildren) {
    toast.error(
      t.t(
        lang,
        (s) =>
          s.components.flowForm.submitValidation
            .originalAmountIsDifferentToChildren
      ),
      TOAST_CONFIG_ERROR
    );
    return false;
  }

  if (!(await validateFlowForWarnings(values, env, lang))) {
    return false;
  }
  if (
    isPending &&
    (pendingValues === null ||
      (pendingValues !== undefined &&
        pendingValuesHandled !== Object.keys(pendingValues).length))
  ) {
    toast.error(
      t.t(lang, (s) => s.components.flowForm.submitValidation.pendingValues),
      TOAST_CONFIG_ERROR
    );
    return false;
  }
  return true;
};
