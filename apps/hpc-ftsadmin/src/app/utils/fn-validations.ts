import type { FlowFormType } from '../components/flow-form/flow-form';
import { valueToInteger } from './map-functions';
import React from 'react';
import { Environment } from '../../environments/interface';
import { type LanguageKey, t } from '../../i18n';

const validateEarmarking = (values: FlowFormType, lang: LanguageKey) => {
  if (!values.earmarkingType) {
    return t.t(lang, (s) => s.components.flowForm.submitValidation.earmarking);
  }
};

const validateReportingOrganization = (
  values: FlowFormType,
  lang: LanguageKey
) => {
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
      return t.t(
        lang,
        (s) => s.components.flowForm.submitValidation.reportingOrganization
      );
    }
  }
};

const validateEmergency = async (
  values: FlowFormType,
  env: Environment,
  lang: LanguageKey
) => {
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
    return t.t(lang, (s) => s.components.flowForm.submitValidation.emergency, {
      emergency: emergencies[0].name,
    });
  }
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

export const validateFlowForWarnings = async (
  values: FlowFormType,
  setError: React.Dispatch<React.SetStateAction<string | undefined>>,
  env: Environment,
  lang: LanguageKey
) => {
  const reportingDetailWarning = validateReportingDetails(values, lang);
  if (reportingDetailWarning) {
    setError(reportingDetailWarning);
    return false;
  }

  const warnings: (string | undefined)[] = [
    validateEarmarking(values, lang),
    validateReportingOrganization(values, lang),
    await validateEmergency(values, env, lang),
  ];

  for (const warning of warnings) {
    if (warning) {
      if (!window.confirm(warning)) {
        return false;
      }
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
