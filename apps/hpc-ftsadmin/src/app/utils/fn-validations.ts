import type { FlowFormType } from '../components/flow-form/flow-form';
import { valueToInteger } from './map-functions';
import { Environment } from '../../environments/interface';
import { type LanguageKey, t } from '../../i18n';
import { toast } from 'react-toastify';
import { TOAST_CONFIG_ERROR } from './constants';

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

export const validateFlowForWarnings = async (
  values: FlowFormType,
  env: Environment,
  lang: LanguageKey
) => {
  const reportingDetailWarning = validateReportingDetails(values, lang);
  if (reportingDetailWarning) {
    toast.error(reportingDetailWarning, TOAST_CONFIG_ERROR);
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
