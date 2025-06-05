import { type projects, type usageYears, type util } from '@unocha/hpc-data';
import { THEME } from '@unocha/hpc-ui';
import { type FormikHelpers } from 'formik';
import { type Environment } from '../../environments/interface';
import dayjs from '../../libs/dayjs';
import { type FlowFormType } from '../components/flow-form/flow-form';
import {
  governingEntitiesOptions,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from './fn-promises';
import { valueToInteger } from './map-functions';

type FundingObjectKeys =
  | 'fundingSourceLocations'
  | 'fundingSourceOrganizations'
  | 'fundingSourceGlobalClusters'
  | 'fundingSourceEmergencies'
  | 'fundingSourceUsageYears'
  | 'fundingSourceFieldClusters'
  | 'fundingDestinationLocations'
  | 'fundingDestinationOrganizations'
  | 'fundingDestinationAnonymizedOrganizations'
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
  newValue?: util.FormObjectValue | util.FormObjectValue[] | null;
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

  let formObjectValues: util.FormObjectValue[] | undefined;

  if (isOrganizations(objectType, newUniqueValues)) {
    formObjectValues = organizationsOptions(
      newUniqueValues.map((org) => ({ ...org, chipColor: AUTOFILL_CHIP_COLOR }))
    );
  } else if (isGoverningEntities(objectType, newUniqueValues)) {
    formObjectValues = governingEntitiesOptions(
      newUniqueValues.map((gE) => ({ ...gE, chipColor: AUTOFILL_CHIP_COLOR }))
    );
  } else if (isUsageYears(objectType, newUniqueValues)) {
    formObjectValues = usageYearsOptions(
      newUniqueValues.map((year) => ({
        ...year,
        chipColor: AUTOFILL_CHIP_COLOR,
      }))
    );
  } else {
    formObjectValues = locationsOptions(
      newUniqueValues.map((loc) => ({ ...loc, chipColor: AUTOFILL_CHIP_COLOR }))
    );
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

export const autofillOrganizations = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  It only applies to source Organization
  //  Organization field is multi select
  if (!fieldName.includes('Source') || !newValue || !Array.isArray(newValue)) {
    return;
  }

  const lastOrganization = newValue.at(-1);
  if (!lastOrganization) {
    return;
  }
  const organization = await env.model.organizations.getOrganization({
    id: valueToInteger(lastOrganization.value),
  });

  const hasGovernmentsType = organization.categories?.some(
    (cat) => cat.name === 'Governments'
  );
  const hasMultilateralOrganizationsType = organization.categories?.some(
    (cat) => cat.name === 'Multilateral Organizations'
  );

  if (
    organization.categories?.some((cat) => cat.name === 'Pooled Funds') ||
    !hasGovernmentsType
  ) {
    setFieldValue('isNewMoney', false);
  }
  if (hasGovernmentsType || hasMultilateralOrganizationsType) {
    setFieldValue('isNewMoney', true);
  }

  if (!hasGovernmentsType) {
    return;
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
  if (!newValue || Array.isArray(newValue)) {
    return;
  }

  const project = await env.model.projects.getProject({
    id: valueToInteger(newValue.value),
  });

  const usageYears: usageYears.GetUsageYearsResult = [];
  if (project.projectVersion.endDate && project.projectVersion.startDate) {
    const endYear = dayjs(project.projectVersion.endDate).year();
    const startYear = dayjs(project.projectVersion.startDate).year();

    const yearDifference = endYear - startYear;
    if (!yearDifference) {
      usageYears.push(
        ...(await env.model.usageYears.getAutocompleteUsageYears({
          query: `${endYear}`,
        }))
      );
    } else {
      for (let year = startYear; year <= endYear; year++) {
        const fetchedYear =
          await env.model.usageYears.getAutocompleteUsageYears({
            query: `${year}`,
          });
        usageYears.push(...fetchedYear);
      }
    }
  }
  const earmarked = (
    await env.model.categories.getCategories({
      query: 'earmarkingType',
    })
  ).find(({ name }) => name === 'Earmarked');

  const projectPlan = project.projectVersion.plans.at(0);
  let projectLocations = project.projectVersion.locations;
  const projectOrganizations = project.projectVersion.organizations;
  const projectGlobalClusters = project.projectVersion.globalClusters;

  if (projectPlan) {
    setPlan(fieldName, values, setFieldValue, projectPlan);
    const [{ emergencies, locations }, governingEntities] = await Promise.all([
      env.model.plans.getPlan({
        id: projectPlan.id,
        scopes: ['emergencies', 'planVersion', 'locations'],
      }),
      env.model.governingEntities.getGoverningEntitiesByPlanId({
        planId: valueToInteger(projectPlan.id),
        excludeAttachments: true,
      }),
    ]);
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

    const projectGlobalClustersIds = new Set(
      projectGlobalClusters.map((gC) => gC.id)
    );
    helperSetFieldValue(
      fieldName,
      'FieldClusters',
      setFieldValue,
      values,
      governingEntities.filter((gE) =>
        gE.globalClusterIds.some((id) => projectGlobalClustersIds.has(id))
      )
    );
  }

  if (fieldName.includes('Destination') && earmarked) {
    setFieldValue('earmarkingType', {
      value: earmarked.id,
      displayLabel: earmarked.name,
    } satisfies util.FormObjectValue);
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

  if (usageYears.length > 0) {
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
  const direction = fieldName.includes('Source') ? 'Source' : 'Destination';

  // When Plan is modified or set to null, we need to clear Field Clusters
  setFieldValue(`funding${direction}FieldClusters`, []);
  //  Plan field is not multi select
  if (!newValue || Array.isArray(newValue)) {
    return;
  }

  const planId = valueToInteger(newValue.value);
  const { years, locations, emergencies } = await env.model.plans.getPlan({
    id: planId,
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

  const globalClusters = values[`funding${direction}GlobalClusters`].map(
    ({ value }) => valueToInteger(value)
  );
  if (globalClusters.length) {
    const fieldClusters = (
      await env.model.governingEntities.getGoverningEntitiesByPlanId({
        planId,
        excludeAttachments: true,
      })
    ).filter((fC) =>
      fC.globalClusterIds.some((id) => globalClusters.includes(id))
    );

    helperSetFieldValue(
      fieldName,
      'FieldClusters',
      setFieldValue,
      values,
      fieldClusters
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

  //  FieldClusters field is multi select
  if (!newValue || !Array.isArray(newValue)) {
    return;
  }

  if (newValue.length > 0) {
    const fieldClusters = newValue.filter(
      (fieldCluster) => typeof fieldCluster !== 'string'
    ) as util.FormObjectValue[];

    // Here we make sure to just take the newly added value
    // in case the user removed some of the previously
    // auto filled values
    const lastFieldClusterAdded = fieldClusters.at(-1);
    if (!lastFieldClusterAdded) {
      return;
    }

    const globalClusters = await env.model.governingEntities
      .getGoverningEntity({
        id: valueToInteger(lastFieldClusterAdded.value),
      })
      .then((gE) => gE.globalClusters);

    helperSetFieldValue(
      fieldName,
      'GlobalClusters',
      setFieldValue,
      values,
      globalClusters
    );
  }
};

export const autofillGlobalClusters = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  GlobalClusters field is multi select
  if (!newValue || !Array.isArray(newValue)) {
    return;
  }
  const newGlobalClusterIds = new Set(
    (
      newValue.filter((v) => typeof v !== 'string') as util.FormObjectValue[]
    ).map((v) => valueToInteger(v.value))
  );

  const direction = fieldName.includes('Destination')
    ? 'Destination'
    : 'Source';

  const planId = values[`funding${direction}Plan`]?.value;
  if (!planId) {
    return;
  }

  const globalClusters = await env.model.governingEntities
    .getGoverningEntitiesByPlanId({
      planId: valueToInteger(planId),
      excludeAttachments: true,
    })
    .then((gEs) =>
      gEs.filter((gE) =>
        gE.globalClusterIds.some((id) => newGlobalClusterIds.has(id))
      )
    );

  helperSetFieldValue(
    fieldName,
    'FieldClusters',
    setFieldValue,
    values,
    globalClusters
  );
};

export const autofillUsageYears = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  UsageYears field is multi select
  if (
    !newValue ||
    !Array.isArray(newValue) ||
    newValue.length < 2 ||
    values.keywords.some((keyword) => keyword.displayLabel === 'Multiyear')
  ) {
    return;
  }
  const multiyear = await env.model.categories
    .getKeywords()
    .then((keywords) =>
      keywords.find((keyword) => keyword.name === 'Multiyear')
    );

  if (!multiyear) {
    return;
  }
  setFieldValue('keywords', [
    ...values.keywords,
    {
      displayLabel: multiyear.name,
      value: multiyear.id,
    } satisfies util.FormObjectValue,
  ]);
};

export const autofillEmergencies = async ({
  fieldName,
  setFieldValue,
  values,
  env,
  newValue,
}: AutofillProps) => {
  setFieldValue(fieldName, newValue);

  //  Emergencies field is multi select
  if (!newValue || !Array.isArray(newValue)) {
    return;
  }
  const lastEmergency = newValue.at(-1);

  if (!lastEmergency) {
    return;
  }
  const emergency = await env.model.emergencies.getEmergency({
    id: valueToInteger(lastEmergency.value),
  });

  //  Only autofill if there is one location associated
  if (emergency.locations.length === 1) {
    helperSetFieldValue(
      fieldName,
      'Locations',
      setFieldValue,
      values,
      emergency.locations
    );
  }
};
