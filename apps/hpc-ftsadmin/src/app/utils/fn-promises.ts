import {
  type categories,
  type flows,
  type locations,
  type usageYears,
  type util,
} from '@unocha/hpc-data';
import { type Environment } from '../../environments/interface';
import { flowToFormObjectValue, valueToInteger } from './map-functions';

export const defaultOptions = (
  response: Array<{
    name: string;
    id: number;
    chipColor?: string;
    tooltip?: string;
  }>
): util.FormObjectValue[] => {
  return response.map(({ name, id, chipColor, tooltip }) => ({
    displayLabel: name,
    value: id,
    chipColor,
    tooltip,
  }));
};

const nameToSnakeCase = (
  response: Array<{
    name: string;
  }>
): util.FormObjectValue[] => {
  return response.map(({ name }) => ({
    displayLabel: name,
    value: name.toLocaleLowerCase().replace(' ', '_'),
  }));
};

const currenciesOptions = (
  response: Array<{
    code: string;
  }>
): util.FormObjectValue[] => {
  return response.map(({ code }) => ({
    displayLabel: code,
    value: code,
  }));
};

export const organizationsOptions = (
  response: Array<{
    name: string;
    abbreviation: string;
    id: number;
    collectiveInd?: boolean;
    chipColor?: string;
    tooltip?: string;
  }>
): util.FormObjectValue[] => {
  return response.map(
    ({ name, abbreviation, id, chipColor, tooltip, collectiveInd }) => ({
      displayLabel: `${name} [${abbreviation}]`,
      value: id,
      confidential: collectiveInd,
      chipColor,
      tooltip,
    })
  );
};

export const locationsOptions = (
  response: Array<{
    name: string;
    id: number;
    children?: locations.Location[];
    chipColor?: string;
    tooltip?: string;
  }>
): util.FormObjectValue[] => {
  const res: util.FormObjectValue[] = [];

  for (const { children, name, id, chipColor, tooltip } of response) {
    const hasChildren = children && children.length > 0;
    const parentLocation: util.FormObjectValue = {
      displayLabel: name,
      value: id,
      hasChildren,
      chipColor,
      tooltip,
    };
    res.push(parentLocation);
    if (children && children.length > 0) {
      for (const responseLevelValue of children) {
        res.push({
          displayLabel: responseLevelValue.name,
          value: responseLevelValue.id,
          parent: parentLocation,
          chipColor,
          tooltip,
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
    chipColor?: string;
    tooltip?: string;
  }>
): util.FormObjectValue[] => {
  return response.map(({ year, id, chipColor, tooltip }) => ({
    displayLabel: year,
    value: id,
    chipColor,
    tooltip,
  }));
};

export const governingEntitiesOptions = (
  response: Array<{
    id: number;
    governingEntityVersion: { name: string };
    chipColor?: string;
    tooltip?: string;
  }>
) => {
  return response.map(({ governingEntityVersion, id, chipColor, tooltip }) => ({
    displayLabel: governingEntityVersion.name,
    value: id,
    chipColor,
    tooltip,
  }));
};

const projectsOptions = (
  response: Array<{
    name: string;
    id: number;
    code: string | null;
    chipColor?: string;
    tooltip?: string;
  }>
): util.FormObjectValue[] => {
  return response.map(({ name, id, chipColor, tooltip, code }) => ({
    displayLabel: `${name}${code ? ` [${code}]` : ''}`,
    value: id,
    chipColor,
    tooltip,
  }));
};
// Functions to pass to <AsyncAutocompleteSelect /> fnPromise prop

export const fnOrganizations = async (
  query: { query: string },
  env: Environment
): Promise<util.FormObjectValue[]> => {
  const response =
    await env.model.organizations.getAutocompleteOrganizations(query);
  return organizationsOptions(response);
};

const YEARS_OPTION_RANGE = 5;
export const usageYearFirstViewCondition = (usageYear: FormObjectValue) => {
  const currentYear = new Date().getFullYear();
  return (
    parseInt(usageYear.displayLabel) > currentYear - YEARS_OPTION_RANGE &&
    parseInt(usageYear.displayLabel) < currentYear + YEARS_OPTION_RANGE
  );
};
export const fnUsageYears = async (
  env: Environment
): Promise<util.FormObjectValue[]> => {
  const CURRENT_YEAR = new Date().getFullYear();
  const response = await env.model.usageYears
    .getUsageYears()
    .then((usageYears) => {
      const sortedUsageYears: usageYears.GetUsageYearsResult = [];
      const displayFirstUsageYears = [];
      for (const usageYear of usageYears) {
        const yearDifference = CURRENT_YEAR - valueToInteger(usageYear.year);
        if (
          yearDifference < YEARS_OPTION_RANGE &&
          yearDifference > -YEARS_OPTION_RANGE
        ) {
          displayFirstUsageYears.push(usageYear);
        } else {
          sortedUsageYears.push(usageYear);
        }
      }
      return [...displayFirstUsageYears, ...sortedUsageYears];
    });
  return usageYearsOptions(response);
};

export const fnLocations = async (
  query: { query: string },
  env: Environment
): Promise<util.FormObjectValue[]> => {
  const response = await env.model.locations.getAutocompleteLocations(query);
  return locationsOptions(response);
};

export const fnProjects = async (
  query: { query: string },
  env: Environment
) => {
  const response = await env.model.projects.getAutocompleteProjects(query);
  return projectsOptions(response);
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
): Promise<util.FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowType',
  });
  return nameToSnakeCase(response);
};

export const fnFlowStatusSnakeCase = async (
  env: Environment
): Promise<util.FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowStatus',
  });
  return nameToSnakeCase(response);
};

export const fnFlowTypeId = async (
  env: Environment
): Promise<util.FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowType',
  });
  return defaultOptions(response);
};

export const fnFlowStatusId = async (
  env: Environment
): Promise<util.FormObjectValue[]> => {
  const response = await env.model.categories.getCategories({
    query: 'flowStatus',
  });
  return defaultOptions(response);
};
