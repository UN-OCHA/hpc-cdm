import { Box, Button, IconButton, Typography } from '@mui/material';
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
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdAdd, MdRemoveCircleOutline } from 'react-icons/md';
import { t } from '../../i18n';
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

interface Field<T>
  extends Omit<
    FormNewEditFlowObjectControlProps<T>,
    'refDirection' | 'objectType'
  > {
  isDeletable?: boolean;
}

interface Fields {
  organization: Field<organizations.Organization>;
  usageYear: Field<usageYears.UsageYear>;
  location: Field<locations.Location>;
  emergency: Field<emergencies.Emergency>;
  plan: Field<plans.Plan>;
  project: Field<projects.Project>;
  globalCluster: Field<globalClusters.GlobalCluster>;
  governingEntity?: Field<governingEntities.GoverningEntity>;
  anonymizedOrganization?: Field<organizations.Organization>;
}

export default function FormNewEditFlowObjects(props: Props) {
  const { refDirection, label } = props;
  const { model } = getEnv();
  const { watch, getValues } = useFormContext();

  const watchPlan = watch(`${refDirection}.plan`);
  const watchDestOrgs = watch('destination.organization');

  const showGoverningEntities = !!(watchPlan && watchPlan.length);
  const showAnonymizedOrgs = !!(
    watchDestOrgs &&
    watchDestOrgs.some((org: organizations.Organization) => org.collectiveInd)
  );

  const fields = useMemo<Fields>(
    () => ({
      organization: {
        label: (s) => s.components.forms.newEditFlow.fields.organizations,
        getOptions: model.organizations.getOrganizationsAutocomplete,
        searchOnType: true,
      },
      ...(showAnonymizedOrgs && {
        anonymizedOrganization: {
          label: (s) =>
            s.components.forms.newEditFlow.fields.anonymizedOrganizations,
          getOptions: model.organizations.getOrganizationsAutocomplete,
          searchOnType: true,
          isDeletable: true,
        },
      }),
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
        isDeletable: refDirection === 'source',
      },
      project: {
        label: (s) => s.components.forms.newEditFlow.fields.projects,
        getOptions: model.projects.getProjectsAutocomplete,
        searchOnType: true,
        isDeletable: true,
      },
      emergency: {
        label: (s) => s.components.forms.newEditFlow.fields.emergencies,
        getOptions: model.emergencies.getEmergenciesAutocomplete,
        searchOnType: true,
        isDeletable: true,
      },
      globalCluster: {
        label: (s) => s.components.forms.newEditFlow.fields.globalClusters,
        getOptions: model.globalClusters.getGlobalClusters,
        isDeletable: refDirection === 'source',
      },
      ...(showGoverningEntities && {
        governingEntity: {
          label: (s) => s.components.forms.newEditFlow.fields.governingEntities,
          getOptions: model.governingEntities.getGoverningEntitiesAutocomplete,
          searchOnType: true,
          isDeletable: true,
        },
      }),
    }),
    [model, refDirection, showGoverningEntities, showAnonymizedOrgs]
  );

  const [visibleFields, setVisibleFields] = useState(
    new Set(
      (Object.keys(fields) as (keyof Fields)[]).filter(
        // TypeScript types the return value of the Object.keys() method as string[].
        (key) =>
          !fields[key]?.isDeletable ||
          getValues(`${refDirection}.${key}`).length
      )
    )
  );
  const setVisible = (key: keyof Fields) => {
    setVisibleFields(new Set(visibleFields).add(key));
  };
  const setHidden = (key: keyof Fields) => {
    const visible = new Set(visibleFields);
    visible.delete(key);
    setVisibleFields(visible);
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Fieldset>
          <Typography variant="h3" component="legend" sx={{ marginBottom: 2 }}>
            {label}
          </Typography>
          {Object.entries(fields).map(([key, { isDeletable, ...rest }]) =>
            visibleFields.has(key as keyof Fields) ? (
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start' }}
                key={`${refDirection}.${key}`}
              >
                <FormNewEditFlowObjectControl
                  refDirection={refDirection}
                  objectType={key}
                  {...rest}
                />
                {isDeletable && (
                  <IconButton
                    aria-label={t.get(lang, (s) => s.common.remove)}
                    sx={{ marginLeft: 1, marginTop: 3 }}
                    onClick={() => setHidden(key as keyof Fields)}
                  >
                    <MdRemoveCircleOutline />
                  </IconButton>
                )}
              </Box>
            ) : null
          )}
          <Box sx={{ marginY: 2 }}>
            {Object.entries(fields).map(([key, { label }]) =>
              !visibleFields.has(key as keyof Fields) ? (
                <Button
                  key={`autocompleteButton.${refDirection}.${key}`}
                  startIcon={
                    <MdAdd aria-label={t.get(lang, (s) => s.common.add)} />
                  }
                  variant="outlined"
                  sx={{ marginRight: 1, marginBottom: 1 }}
                  onClick={() => setVisible(key as keyof Fields)}
                >
                  {t.get(lang, label)}
                </Button>
              ) : null
            )}
          </Box>
        </Fieldset>
      )}
    </AppContext.Consumer>
  );
}
