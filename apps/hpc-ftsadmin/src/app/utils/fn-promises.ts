import { categories } from '@unocha/hpc-data';
import { Environment } from '../../environments/interface';
import { FormObjectValue } from '@unocha/hpc-ui';

/** Functions to pass to <AsyncAutocompleteSelect /> fnPromise prop */

export const fnOrganizations = async (
  query: { query: string },
  env: Environment
) => {
  const response =
    await env.model.organizations.getAutocompleteOrganizations(query);
  const options: Array<FormObjectValue> = response.map((responseValue) => {
    return {
      displayLabel: `${responseValue.name} [${responseValue.abbreviation}]`,
      value: responseValue.id,
    };
  });
  return options;
};

export const fnUsageYears = async (env: Environment) => {
  const response = await env.model.usageYears.getUsageYears();
  const options: Array<FormObjectValue> = response.map((responseValue) => {
    return {
      displayLabel: responseValue.year,
      value: responseValue.id,
    };
  });
  return options;
};

const defaultOptions = (
  response: Array<{
    name: string;
    id: number;
  }>
) => {
  const options: Array<FormObjectValue> = response.map((responseValue) => {
    return {
      displayLabel: responseValue.name,
      value: responseValue.id,
    };
  });
  return options;
};

export const fnLocations = async (
  query: { query: string },
  env: Environment
) => {
  const response = await env.model.locations.getAutocompleteLocations(query);
  return defaultOptions(response);
};

export const fnProjects = async (
  query: { query: string },
  env: Environment
) => {
  const response = await env.model.projects.getAutocompleteProjects(query);
  return defaultOptions(response);
};

export const fnPlans = async (query: { query: string }, env: Environment) => {
  const response = await env.model.plans.getAutocompletePlans(query);
  return defaultOptions(response);
};

export const fnGlobalClusters = async (env: Environment) => {
  const response = await env.model.globalClusters.getGlobalClusters();
  return defaultOptions(response);
};

export const fnEmergencies = async (
  query: { query: string },
  env: Environment
) => {
  const response =
    await env.model.emergencies.getAutocompleteEmergencies(query);
  return defaultOptions(response);
};

export const fnCategories = async (
  query: categories.CategoryGroup,
  env: Environment
) => {
  const response = await env.model.categories.getCategories({
    query,
  });
  return defaultOptions(response);
};
