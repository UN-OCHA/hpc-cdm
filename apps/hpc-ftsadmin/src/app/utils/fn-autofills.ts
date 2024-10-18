import { FormObjectValue, projects, usageYears } from '@unocha/hpc-data';
import { FlowFormType } from '../components/flow-form/flow-form';
import { FormikHelpers } from 'formik';
import { Environment } from '../../environments/interface';
import { valueToInteger } from './map-functions';
import {
  defaultOptions,
  governingEntitiesOptions,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from './fn-promises';
import { THEME } from '@unocha/hpc-ui';
import dayjs from 'dayjs';

type FundingObjectKeys =
  | 'fundingSourceLocations'
  | 'fundingSourceOrganizations'
  | 'fundingSourceGlobalClusters'
  | 'fundingSourceEmergencies'
  | 'fundingSourceUsageYears'
  | 'fundingSourceFieldClusters'
  | 'fundingDestinationLocations'
  | 'fundingDestinationOrganizations'
  | 'fundingDestinationGlobalClusters'
  | 'fundingDestinationEmergencies'
  | 'fundingDestinationUsageYears'
  | 'fundingDestinationFieldClusters';

type AutofillProps = {
  fieldName:
    | FundingObjectKeys
    | 'fundingSourcePlan'
    | 'fundingSourceProject'
    | 'fundingDestinationPlan'
    | 'fundingDestinationProject';

  setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'];
  values: FlowFormType;
  env: Environment;
  newValue?:
    | NonNullable<string | FormObjectValue>
    | (string | FormObjectValue)[]
    | null;
};

type FieldValueType = {
  Locations: Array<{ id: number; name: string }>;
  Organizations: Array<{ id: number; name: string; abbreviation: string }>;
  GlobalClusters: Array<{ id: number; name: string }>;
  Emergencies: Array<{ id: number; name: string }>;
  UsageYears: Array<{ id: number; year: string }>;
  FieldClusters: Array<{
    id: number;
    governingEntityVersion: { name: string };
  }>;
};

const AUTOFILL_CHIP_COLOR = THEME.colors.pallete.yellow.normal;

const isOrganizations = (
  fieldName: unknown,
  newUniqueValues: FieldValueType[keyof FieldValueType]
): newUniqueValues is FieldValueType['Organizations'] =>
  fieldName === 'Organizations';
const isUsageYears = (
  fieldName: unknown,
  newUniqueValues: FieldValueType[keyof FieldValueType]
): newUniqueValues is FieldValueType['UsageYears'] =>
  fieldName === 'UsageYears';
const isLocations = (
  fieldName: unknown,
  newUniqueValues: FieldValueType[keyof FieldValueType]
): newUniqueValues is FieldValueType['Locations'] => fieldName === 'Locations';
const isGoverningEntities = (
  fieldName: unknown,
  newUniqueValues: FieldValueType[keyof FieldValueType]
): newUniqueValues is FieldValueType['FieldClusters'] =>
  fieldName === 'FieldClusters';

const helperSetFieldValue = <T extends keyof FieldValueType>(
  fieldName:
    | FundingObjectKeys
    | 'fundingSourcePlan'
    | 'fundingSourceProject'
    | 'fundingDestinationPlan'
    | 'fundingDestinationProject',
  objectType: T,
  setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'],
  values: FlowFormType,
  newValue: FieldValueType[T]
) => {
  let formKey: FundingObjectKeys = `fundingSource${objectType}`;
  if (fieldName.includes('fundingDestination')) {
    formKey = `fundingDestination${objectType}`;
  }
  const formValue = values[formKey];

  const newUniqueValues: FieldValueType[T] = newValue.filter(
    ({ id }) => !formValue.some(({ value }) => value === id)
  ) as typeof newValue;

  //  If value already exist, there is no need to add it again
  if (newUniqueValues.length === 0) {
    return;
  }

  let formObjectValues: FormObjectValue[] | undefined;

  if (isOrganizations(objectType, newUniqueValues)) {
    formObjectValues = organizationsOptions(
      newUniqueValues,
      AUTOFILL_CHIP_COLOR
    );
  } else if (isLocations(objectType, newUniqueValues)) {
    formObjectValues = locationsOptions(newUniqueValues, AUTOFILL_CHIP_COLOR);
  } else if (isUsageYears(objectType, newUniqueValues)) {
    formObjectValues = usageYearsOptions(newUniqueValues, AUTOFILL_CHIP_COLOR);
  } else if (isGoverningEntities(objectType, newUniqueValues)) {
    formObjectValues = governingEntitiesOptions(
      newUniqueValues,
      AUTOFILL_CHIP_COLOR
    );
  } else {
    formObjectValues = defaultOptions(newUniqueValues, AUTOFILL_CHIP_COLOR);
  }

  setFieldValue(formKey, [...formValue, ...formObjectValues]);
};

const setPlan = (
  fieldName: keyof FlowFormType,
  values: FlowFormType,
  setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'],
  newValue: projects.GetProjectResult['projectVersion']['plans'][number]
) => {
  let formKey: keyof FlowFormType = 'fundingSourcePlan';
  if (fieldName.includes('fundingDestination')) {
    formKey = 'fundingDestinationPlan';
  }

  //  If value already exist, there is no need to add it again
  if (values[formKey]?.value !== newValue.id) {
    setFieldValue(formKey, {
      displayLabel: newValue.planVersion.name,
      value: newValue.id,
      chipColor: AUTOFILL_CHIP_COLOR,
    });
  }
};

export const autofillOrganization = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  It only applies to source Organization
  //  Organization field is multi select
  if (
    !fieldName.includes('Source') ||
    !newValue ||
    typeof newValue === 'string' ||
    !Array.isArray(newValue)
  ) {
    return;
  }

  const lastOrganization = newValue.at(-1);
  if (!lastOrganization || typeof lastOrganization === 'string') {
    return;
  }
  const organization = await env.model.organizations.getOrganization({
    id: valueToInteger(lastOrganization.value),
  });

  if (fieldName.includes('Source')) {
    const org = await env.model.organizations.getOrganization({
      id: valueToInteger(lastOrganization.value),
    });
    if (org.categories?.some((cat) => cat.name === 'Pooled Funds')) {
      setFieldValue('isNewMoney', false);
    }
  }

  const organizationLocations = organization.locations;

  if (!organizationLocations || organizationLocations.length === 0) {
    return;
  }

  helperSetFieldValue(
    fieldName,
    'Locations',
    setFieldValue,
    values,
    organizationLocations
  );
};

export const autofillProject = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  Project field is not multi select
  if (!newValue || typeof newValue === 'string' || Array.isArray(newValue)) {
    return;
  }

  const project = await env.model.projects.getProject({
    id: valueToInteger(newValue.value),
  });

  let usageYears: usageYears.GetUsageYearsResult | undefined;
  if (project.projectVersion.endDate && project.projectVersion.startDate) {
    const endYear = dayjs(project.projectVersion.endDate).year();
    const startYear = dayjs(project.projectVersion.startDate).year();

    const yearDifference = endYear - startYear;
    if (!yearDifference) {
      usageYears = await env.model.usageYears.getAutocompleteUsageYears({
        query: `${endYear}`,
      });
    } else {
      usageYears = [];
      for (let year = startYear; year <= endYear; year++) {
        const fetchedYear =
          await env.model.usageYears.getAutocompleteUsageYears({
            query: `${year}`,
          });
        usageYears.push(...fetchedYear);
      }
    }

    usageYears = await env.model.usageYears.getAutocompleteUsageYears({
      query: `${dayjs(project.projectVersion.endDate).year()}`,
    });
  }
  const projectEarmarking = project.projectVersion.categories.find(
    (category) => category.group === 'earmarkingType'
  );
  const projectPlan = project.projectVersion.plans[0];
  let projectLocations = project.projectVersion.locations;
  const projectOrganizations = project.projectVersion.organizations;
  const projectGlobalClusters = project.projectVersion.globalClusters;

  if (projectPlan) {
    setPlan(fieldName, values, setFieldValue, projectPlan);
    const { emergencies, governingEntities, locations } =
      await env.model.plans.getPlan({
        id: projectPlan.id,
        scopes: [
          'emergencies',
          'governingEntities',
          'planVersion',
          'locations',
        ],
      });
    projectLocations = projectLocations.filter((projectLocation) =>
      locations.some((planLocation) => planLocation.id === projectLocation.id)
    );

    helperSetFieldValue(
      fieldName,
      'Emergencies',
      setFieldValue,
      values,
      emergencies
    );
    helperSetFieldValue(
      fieldName,
      'FieldClusters',
      setFieldValue,
      values,
      governingEntities
    );
  }

  if (fieldName.includes('Destination') && projectEarmarking) {
    setFieldValue('earmarkingType', {
      value: projectEarmarking.id,
      displayLabel: projectEarmarking.name,
    });
  }

  if (projectLocations && projectLocations.length > 0) {
    helperSetFieldValue(
      fieldName,
      'Locations',
      setFieldValue,
      values,
      projectLocations
    );
  }

  if (usageYears && usageYears.length > 0) {
    helperSetFieldValue(
      fieldName,
      'UsageYears',
      setFieldValue,
      values,
      usageYears
    );
  }
  if (projectOrganizations && projectOrganizations.length > 0) {
    helperSetFieldValue(
      fieldName,
      'Organizations',
      setFieldValue,
      values,
      projectOrganizations
    );
  }

  if (projectGlobalClusters && projectGlobalClusters.length > 0) {
    helperSetFieldValue(
      fieldName,
      'GlobalClusters',
      setFieldValue,
      values,
      projectGlobalClusters
    );
  }
};

export const autofillPlan = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  Plan field is not multi select
  if (!newValue || typeof newValue === 'string' || Array.isArray(newValue)) {
    return;
  }

  const { years, locations, emergencies } = await env.model.plans.getPlan({
    id: valueToInteger(newValue.value),
    scopes: ['years', 'locations', 'emergencies'],
  });

  if (years && years.length > 0) {
    helperSetFieldValue(fieldName, 'UsageYears', setFieldValue, values, years);
  }

  if (locations && locations.length > 0) {
    helperSetFieldValue(
      fieldName,
      'Locations',
      setFieldValue,
      values,
      locations
    );
  }

  if (emergencies && emergencies.length > 0) {
    helperSetFieldValue(
      fieldName,
      'Emergencies',
      setFieldValue,
      values,
      emergencies
    );
  }
};

export const autofillFieldClusters = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  fieldClusters field is  multi select
  if (!newValue || typeof newValue === 'string' || !Array.isArray(newValue)) {
    return;
  }

  if (newValue && newValue.length > 0) {
    const fieldClusters = newValue.filter(
      (fieldCluster) => typeof fieldCluster !== 'string'
    ) as FormObjectValue[];

    const globalClusters = await Promise.all(
      fieldClusters.map(async (fC) => {
        const gE = await env.model.governingEntities.getGoverningEntity({
          id: valueToInteger(fC.value),
        });
        return gE.globalClusters;
      })
    ).then((gCs) => gCs.flat());

    helperSetFieldValue(
      fieldName,
      'GlobalClusters',
      setFieldValue,
      values,
      globalClusters
    );
  }
};
