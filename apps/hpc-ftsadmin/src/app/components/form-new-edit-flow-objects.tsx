import { Button, IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  emergencies,
  fieldClusters,
  globalClusters,
  locations,
  organizations,
  plans,
  projects,
  usageYears,
} from '@unocha/hpc-data';
import { C, styled } from '@unocha/hpc-ui';
import { useMemo, useState } from 'react';
import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';
import { MdAdd, MdRemoveCircleOutline } from 'react-icons/md';

import { t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { AppContext, getEnv } from '../context';

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
`;

interface FundingOption<T> {
  label: (s: Strings) => string;
  isDeletable?: boolean;
  autocompleteProps: {
    searchOnType?: boolean;
    multiple?: boolean;
    getOptions: (params: any) => Promise<T[]>;
    getOptionLabel: (option: T) => string;
  };
}

interface FundingOptions {
  anonymizedOrganizations: FundingOption<organizations.Organization>;
  emergencies: FundingOption<emergencies.Emergency>;
  fieldClusters?: FundingOption<fieldClusters.FieldCluster>;
  globalClusters: FundingOption<globalClusters.GlobalCluster>;
  locations: FundingOption<locations.Location>;
  organizations: FundingOption<organizations.Organization>;
  plans: FundingOption<plans.Plan>;
  projects: FundingOption<projects.Project>;
  usageYears: FundingOption<usageYears.UsageYear>;
}

interface Props {
  refDirection: 'source' | 'destination';
  name: string;
  label: string;
  form: UseFormReturn<FieldValues, object>;
}

export default function FormNewEditFlowObjects(props: Props) {
  const {
    refDirection,
    name,
    label,
    form: { control, watch },
  } = props;
  const { model } = getEnv();
  const watchPlan = watch(`${name}.plans`);

  const showFieldClusters = useMemo(() => !!watchPlan, [watchPlan]);

  const fundingOptions: FundingOptions = useMemo(
    () => ({
      organizations: {
        label: (s) => s.components.forms.newEditFlow.fields.organizations,
        autocompleteProps: {
          searchOnType: true,
          multiple: true,
          getOptions: model.organizations.getOrganizationsAutocomplete,
          getOptionLabel: (option) => option.name,
        },
      },
      anonymizedOrganizations: {
        label: (s) =>
          s.components.forms.newEditFlow.fields.anonymizedOrganizations,
        isDeletable: true,
        autocompleteProps: {
          searchOnType: true,
          multiple: true,
          getOptions: model.organizations.getOrganizationsAutocomplete,
          getOptionLabel: (option) => option.name,
        },
      },
      usageYears: {
        label: (s) => s.components.forms.newEditFlow.fields.usageYears,
        autocompleteProps: {
          multiple: true,
          getOptions: model.usageYears.getUsageYears,
          getOptionLabel: (option) => option.year,
        },
      },
      locations: {
        label: (s) => s.components.forms.newEditFlow.fields.locations,
        autocompleteProps: {
          searchOnType: true,
          multiple: true,
          getOptions: model.locations.getLocationsAutocomplete,
          getOptionLabel: (option) => option.name,
        },
      },
      globalClusters: {
        label: (s) => s.components.forms.newEditFlow.fields.globalClusters,
        isDeletable: refDirection === 'source',
        autocompleteProps: {
          multiple: true,
          getOptions: model.globalClusters.getGlobalClusters,
          getOptionLabel: (option) => option.name,
        },
      },
      plans: {
        label: (s) => s.components.forms.newEditFlow.fields.plan,
        isDeletable: refDirection === 'source',
        autocompleteProps: {
          searchOnType: true,
          getOptions: model.plans.getPlansAutocomplete,
          getOptionLabel: (option) => option.name,
        },
      },
      projects: {
        label: (s) => s.components.forms.newEditFlow.fields.projects,
        isDeletable: true,
        autocompleteProps: {
          searchOnType: true,
          getOptions: model.projects.getProjectsAutocomplete,
          getOptionLabel: (option) => option.name,
        },
      },
      ...(showFieldClusters && {
        fieldClusters: {
          label: (s) => s.components.forms.newEditFlow.fields.fieldClusters,
          isDeletable: true,
          autocompleteProps: {
            searchOnType: true,
            multiple: true,
            getOptions: model.fieldClusters.getFieldClustersAutocomplete,
            getOptionLabel: (option) => option.name,
          },
        },
      }),
      emergencies: {
        label: (s) => s.components.forms.newEditFlow.fields.emergencies,
        isDeletable: true,
        autocompleteProps: {
          searchOnType: true,
          multiple: true,
          getOptions: model.emergencies.getEmergenciesAutocomplete,
          getOptionLabel: (option) => option.name,
        },
      },
    }),
    [model, refDirection, showFieldClusters]
  );

  const [visibleFundingOptions, setVisibleFundingOptions] = useState(
    new Set(
      (Object.keys(fundingOptions) as Array<keyof FundingOptions>).filter(
        (key) => !fundingOptions[key]?.isDeletable
      )
    )
  );

  const setVisible = (key: keyof FundingOptions) => {
    setVisibleFundingOptions(new Set(visibleFundingOptions).add(key));
  };

  const setHidden = (key: keyof FundingOptions) => {
    const visible = new Set(visibleFundingOptions);
    visible.delete(key);
    setVisibleFundingOptions(visible);
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Fieldset>
          <Typography variant="h3" component="legend" sx={{ marginBottom: 2 }}>
            {label}
          </Typography>
          {Array.from(visibleFundingOptions.values()).map((key) => {
            const option: FundingOption<any> | undefined = fundingOptions[key];
            return (
              option && (
                <Box
                  sx={{ display: 'flex', alignItems: 'center' }}
                  key={`autocompleteAsync-${key}`}
                >
                  <Controller
                    name={`${name}.${key}`}
                    control={control}
                    render={({ field: { onChange } }) => (
                      <C.AutocompleteAsync
                        strings={{
                          ...t.get(
                            lang,
                            (s) => s.components.forms.autocomplete
                          ),
                          label: t.get(lang, option.label),
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        ChipProps={{
                          sx: { maxWidth: '440px!important' },
                        }}
                        fullWidth
                        {...option.autocompleteProps}
                        onChange={(event, value) => onChange(value)}
                      />
                    )}
                  />
                  {option.isDeletable && (
                    <IconButton
                      aria-label={t.get(lang, (s) => s.common.remove)}
                      sx={{ marginLeft: 1, marginTop: 1 }}
                      onClick={() => setHidden(key)}
                    >
                      <MdRemoveCircleOutline />
                    </IconButton>
                  )}
                </Box>
              )
            );
          })}
          <Box sx={{ marginY: 2 }}>
            {(Object.keys(fundingOptions) as Array<keyof FundingOptions>)
              .filter((key) => !visibleFundingOptions.has(key))
              .map((key) => {
                const option = fundingOptions[key];
                return (
                  option && (
                    <Button
                      key={`autocompleteButton-${key}`}
                      startIcon={
                        <MdAdd aria-label={t.get(lang, (s) => s.common.add)} />
                      }
                      variant="outlined"
                      sx={{ marginRight: 1, marginBottom: 1 }}
                      onClick={() => setVisible(key)}
                    >
                      {t.get(lang, option.label)}
                    </Button>
                  )
                );
              })}
          </Box>
        </Fieldset>
      )}
    </AppContext.Consumer>
  );
}
