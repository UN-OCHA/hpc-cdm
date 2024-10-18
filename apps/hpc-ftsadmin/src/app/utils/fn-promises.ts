import {
  categories,
  flows,
  FormObjectValue,
  locations,
} from '@unocha/hpc-data';
import { Environment } from '../../environments/interface';
import { flowToFormObjectValue } from './map-functions';

export const defaultOptions = (
  response: Array<{
    name: string;
    id: number;
  }>,
  chipColor?: string
): FormObjectValue[] => {
  return response.map((responseValue) => ({
    displayLabel: responseValue.name,
    value: responseValue.id,
    chipColor,
  }));
};

const nameToSnakeCase = (
  response: Array<{
    name: string;
  }>
): FormObjectValue[] => {
  return response.map((responseValue) => ({
    displayLabel: responseValue.name,
    value: responseValue.name.toLocaleLowerCase().replace(' ', '_'),
  }));
};

const currenciesOptions = (
  response: Array<{
    code: string;
  }>
): FormObjectValue[] => {
  return response.map((responseValue) => ({
    displayLabel: responseValue.code,
    value: responseValue.code,
  }));
};

export const organizationsOptions = (
  response: Array<{
    name: string;
    abbreviation: string;
    id: number;
  }>,
  chipColor?: string
): FormObjectValue[] => {
  return response.map((responseValue) => ({
    displayLabel: `${responseValue.name} [${responseValue.abbreviation}]`,
    value: responseValue.id,
    chipColor,
  }));
};

export const locationsOptions = (
  response: Array<{
    name: string;
    id: number;
    children?: locations.Location[];
  }>,
  chipColor?: string
): FormObjectValue[] => {
  const res: Array<FormObjectValue> = [];

  for (const responseValue of response) {
    const hasChildren =
      responseValue.children && responseValue.children.length > 0;
    const parentLocation: FormObjectValue = {
      displayLabel: responseValue.name,
      value: responseValue.id,
      hasChildren,
      chipColor,
    };
    res.push(parentLocation);
    if (responseValue.children && responseValue.children.length > 0) {
      for (const responseLevelValue of responseValue.children) {
        res.push({
          displayLabel: responseLevelValue.name,
          value: responseLevelValue.id,
          parent: parentLocation,
          chipColor,
        });
      }
    }
  }
  return res;
};

export const usageYearsOptions = (
  response: Array<{
    year: string;
    id: number;
  }>,
  chipColor?: string
): FormObjectValue[] => {
  return response.map((responseValue) => ({
    displayLabel: responseValue.year,
    value: responseValue.id,
    chipColor,
  }));
};

export const governingEntitiesOptions = (
  response: Array<{ id: number; governingEntityVersion: { name: string } }>,
  chipColor?: string
) => {
  return response.map((responseValue) => ({
    displayLabel: responseValue.governingEntityVersion.name,
    value: responseValue.id,
    chipColor,
  }));
};
// Functions to pass to <AsyncAutocompleteSelect /> fnPromise prop

export const fnOrganizations = async (
  query: { query: string },
  env: Environment
): Promise<Array<FormObjectValue>> => {
  const response =
    await env.model.organizations.getAutocompleteOrganizations(query);
  return organizationsOptions(response);
};

export const fnUsageYears = async (
  env: Environment
): Promise<Array<FormObjectValue>> => {
  const response = await env.model.usageYears.getUsageYears();
  return usageYearsOptions(response);
};

export const fnLocations = async (
  query: { query: string },
  env: Environment
): Promise<Array<FormObjectValue>> => {
  const response = await env.model.locations.getAutocompleteLocations(query);
  return locationsOptions(response);
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

export const fnGoverningEntities = async (env: Environment, id: number) => {
  const response = await env.model.plans.getPlan({
    id,
    scopes: ['governingEntities'],
  });

  return governingEntitiesOptions(response.governingEntities);
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

export const fnCurrencies = async (env: Environment) => {
  const response = await env.model.currencies.getCurrencies();
  return currenciesOptions(response);
};

export const fnFlows = async (
  query: { query: string },
  env: Environment,
  saveFlows?: React.Dispatch<
    React.SetStateAction<flows.GetFlowsAutocompleteResult | undefined>
  >
) => {
  const response = await env.model.flows.getAutocompleteFlows(query);
  if (saveFlows) {
    saveFlows(response);
  }
  return response.map(flowToFormObjectValue);
};

export const fnFlowTypeSnakeCase = async (
  env: Environment
): Promise<FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowType',
  });
  return nameToSnakeCase(response);
};

export const fnFlowStatusSnakeCase = async (
  env: Environment
): Promise<FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowStatus',
  });
  return nameToSnakeCase(response);
};

export const fnFlowTypeId = async (
  env: Environment
): Promise<FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowType',
  });
  return defaultOptions(response);
};

export const fnFlowStatusId = async (
  env: Environment
): Promise<FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowStatus',
  });
  return defaultOptions(response);
};
