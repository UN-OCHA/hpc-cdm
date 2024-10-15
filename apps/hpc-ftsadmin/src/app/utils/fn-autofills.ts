import { FormObjectValue } from '@unocha/hpc-data';
import { FlowFormType } from '../components/flow-form/flow-form';
import { FormikHelpers } from 'formik';
import { Environment } from '../../environments/interface';
import { valueToInteger } from './map-functions';
import { locationsOptions } from './fn-promises';
import { THEME } from '@unocha/hpc-ui';

const AUTOFILL_CHIP_COLOR = THEME.colors.pallete.yellow.normal;

export const autofillOrganization = async (
  fieldName: keyof FlowFormType,
  setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'],
  values: FlowFormType,
  env: Environment,
  newValue?:
    | NonNullable<string | FormObjectValue>
    | (string | FormObjectValue)[]
    | null
) => {
  setFieldValue(fieldName, newValue);

  //  Organization field is multi select
  if (!newValue || typeof newValue === 'string' || !Array.isArray(newValue)) {
    return;
  }

  const lastOrganization = newValue.at(-1);
  console.log(lastOrganization);
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

  const organizationLocation = organization.locations?.[0];

  if (!organizationLocation) {
    return;
  }

  let formKey: keyof FlowFormType = 'fundingSourceLocations';
  if (fieldName.includes('fundingDestination')) {
    formKey = 'fundingDestinationLocations';
  }

  //  If value already exist, there is no need to add it again
  if (
    values[formKey].find(
      (location) => location.value === organizationLocation.id
    )
  ) {
    return;
  }

  setFieldValue(formKey, [
    ...values[formKey],
    ...locationsOptions([organizationLocation], AUTOFILL_CHIP_COLOR),
  ]);
};
