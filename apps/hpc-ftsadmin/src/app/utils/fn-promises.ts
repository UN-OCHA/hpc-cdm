import { categories, FormObjectValue } from '@unocha/hpc-data';
import { Environment } from '../../environments/interface';

// Functions to pass to <AsyncAutocompleteSelect /> fnPromise prop

export const fnOrganizations = async (
  query: { query: string },
  env: Environment
): Promise<Array<FormObjectValue>> => {
  const response =
    await env.model.organizations.getAutocompleteOrganizations(query);
  return response.map((responseValue) => ({
    displayLabel: `${responseValue.name} [${responseValue.abbreviation}]`,
    value: responseValue.id,
  }));
};

export const fnUsageYears = async (
  env: Environment
): Promise<Array<FormObjectValue>> => {
  const response = await env.model.usageYears.getUsageYears();
  return response.map((responseValue) => ({
    displayLabel: responseValue.year,
    value: responseValue.id,
  }));
};

const defaultOptions = (
  response: Array<{
    name: string;
    id: number;
  }>
): Array<FormObjectValue> => {
  return response.map((responseValue) => ({
    displayLabel: responseValue.name,
    value: responseValue.id,
  }));
};

export const fnLocations = async (
  query: { query: string },
  env: Environment
): Promise<Array<FormObjectValue>> => {
  const response = await env.model.locations.getAutocompleteLocations(query);
  const res: Array<FormObjectValue> = [];

  for (const responseValue of response) {
    const hasChildren =
      responseValue.children && responseValue.children.length > 0;
    const parentLocation: FormObjectValue = {
      displayLabel: responseValue.name,
      value: responseValue.id,
      hasChildren: hasChildren,
    };
    res.push(parentLocation);
    if (hasChildren) {
      for (const responseLevelValue of responseValue.children) {
        res.push({
          displayLabel: responseLevelValue.name,
          value: responseLevelValue.id,
          parent: parentLocation,
        });
      }
    }
  }
  return res;
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
