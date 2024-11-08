import * as t from 'io-ts';
import type { FlowFormType } from '../components/flow-form/flow-form';
import { valueToInteger } from './map-functions';
import React from 'react';
import { Environment } from '../../environments/interface';

const validateEarmarking = (values: FlowFormType) => {
  if (!values.earmarkingType) {
    return 'Earmarking value is blank, do you still want to save?';
  }
};

const validateReportingOrganization = (values: FlowFormType) => {
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
      return "Your flow's Report Detail organization doesn't match the source or destination organization  or that of its parked parent. Are you sure this is right?";
    }
  }
};

const validateEmergency = async (values: FlowFormType, env: Environment) => {
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
    return `This flow has at least one emergency available for the selected year(s) and location(s), like ${emergencies[0].name} do you still want to save?`;
  }
};

const validateReportingDetails = (values: FlowFormType) => {
  const reportingDetails = values.reportingDetails;
  for (const reportingDetail of reportingDetails) {
    if (
      !reportingDetail.reportedByOrganization ||
      !reportingDetail.reportChannel
    ) {
      return 'Please fill all required fields of Reporting Details';
    }

    if (reportingDetail.file && !reportingDetail.reportFileTitle) {
      return 'Please fill the Title field for the uploaded file in Reporting Details';
    }

    if (reportingDetail.url && !reportingDetail.reportURLTitle) {
      return 'Please fill the Title field for the url supplied in Reporting Details';
    }
  }
};

export const validateFlowForWarnings = async (
  values: FlowFormType,
  setError: React.Dispatch<React.SetStateAction<string | undefined>>,
  env: Environment
) => {
  const reportingDetailWarning = validateReportingDetails(values);
  if (reportingDetailWarning) {
    setError(reportingDetailWarning);
    return false;
  }

  const warnings: (string | undefined)[] = [
    validateEarmarking(values),
    validateReportingOrganization(values),
    await validateEmergency(values, env),
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
