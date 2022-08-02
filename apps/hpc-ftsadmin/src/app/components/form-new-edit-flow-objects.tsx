import { Typography } from '@mui/material';
import {
  emergencies,
  globalClusters,
  governingEntities,
  locations,
  organizations,
  plans,
  projects,
  usageYears,
} from '@unocha/hpc-data';
import { styled } from '@unocha/hpc-ui';
import { AppContext, getEnv } from '../context';
import FormNewEditFlowObjectControl, {
  FormNewEditFlowObjectControlProps,
} from './form-new-edit-flow-object-control';

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
`;

interface Props {
  refDirection: 'source' | 'destination';
  label: string;
}

type Field<T> = Omit<FormNewEditFlowObjectControlProps<T>, 'refDirection' | 'objectType'>;

interface Fields {
  organization: Field<organizations.Organization>;
  usageYear: Field<usageYears.UsageYear>;
  location: Field<locations.Location>;
  emergency: Field<emergencies.Emergency>;
  plan: Field<plans.Plan>;
  project: Field<projects.Project>;
  globalCluster: Field<globalClusters.GlobalCluster>;
  governingEntity: Field<governingEntities.GoverningEntity>;
  anonymizedOrganization: Field<organizations.Organization>;
}

export default function FormNewEditFlowObjects(props: Props) {
  const { refDirection, label } = props;
  const { model } = getEnv();
  const fields: Fields = {
    organization: {
      label: (s) => s.components.forms.newEditFlow.fields.organizations,
      getOptions: model.organizations.getOrganizationsAutocomplete,
      searchOnType: true,
    },
    anonymizedOrganization: {
      label: (s) =>
        s.components.forms.newEditFlow.fields.anonymizedOrganizations,
      getOptions: model.organizations.getOrganizationsAutocomplete,
      searchOnType: true,
    },
    usageYear: {
      label: (s) => s.components.forms.newEditFlow.fields.usageYears,
      getOptions: model.usageYears.getUsageYears,
      optionLabel: 'year',
    },
    location: {
      label: (s) => s.components.forms.newEditFlow.fields.locations,
      getOptions: model.locations.getLocationsAutocomplete,
      searchOnType: true,
    },
    plan: {
      label: (s) => s.components.forms.newEditFlow.fields.plans,
      getOptions: model.plans.getPlansAutocomplete,
      searchOnType: true,
    },
    project: {
      label: (s) => s.components.forms.newEditFlow.fields.projects,
      getOptions: model.projects.getProjectsAutocomplete,
      searchOnType: true,
    },
    emergency: {
      label: (s) => s.components.forms.newEditFlow.fields.emergencies,
      getOptions: model.emergencies.getEmergenciesAutocomplete,
      searchOnType: true,
    },
    globalCluster: {
      label: (s) => s.components.forms.newEditFlow.fields.globalClusters,
      getOptions: model.globalClusters.getGlobalClusters,
    },
    governingEntity: {
      label: (s) => s.components.forms.newEditFlow.fields.governingEntities,
      getOptions: model.governingEntities.getGoverningEntitiesAutocomplete,
      searchOnType: true,
    },
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Fieldset>
          <Typography variant="h3" component="legend" sx={{ marginBottom: 2 }}>
            {label}
          </Typography>
          {Object.entries(fields).map(([key, { ...props }]) => (
            <FormNewEditFlowObjectControl
              key={`${refDirection}.${key}`}
              refDirection={refDirection}
              objectType={key}
              {...props}
            />
          ))}
        </Fieldset>
      )}
    </AppContext.Consumer>
  );
}
