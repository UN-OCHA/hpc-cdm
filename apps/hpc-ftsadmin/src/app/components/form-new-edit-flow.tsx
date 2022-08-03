import { Grid, Typography } from '@mui/material';
import { flows, projectVersions } from '@unocha/hpc-data';
import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { t } from '../../i18n';
import { AppContext } from '../context';
import FormNewEditFlowObjects from './form-new-edit-flow-objects';

interface Props {
  existing?: flows.Flow;
}

const inititalFlowObjects: {
  [key in flows.FlowObjectType]: { id: number; flowObject: unknown }[];
} = {
  organization: [],
  anonymizedOrganization: [],
  usageYear: [],
  location: [],
  emergency: [],
  plan: [],
  project: [],
  globalCluster: [],
  governingEntity: [],
};

const initialFlowDirs = {
  source: cloneDeep(inititalFlowObjects),
  destination: cloneDeep(inititalFlowObjects),
};

const mapper = new Map(
  Object.keys(inititalFlowObjects).map((key) => [
    key,
    key.endsWith('y') ? `${key.substring(0, key.length - 1)}ies` : `${key}s`,
  ])
);

export default function FormNewEditFlow(props: Props) {
  const { existing } = props;
  const isExistingFlow = !!existing;
  const initial = {
    ...existing,
    ...initialFlowDirs,
  };

  const formMethods = useForm<typeof initial>({
    defaultValues: useMemo(() => {
      if (!existing) {
        return {};
      }

      return existing.flowObjects?.reduce((acc, curr) => {
        const key = mapper.get(curr.objectType);

        if (!key) {
          return acc;
        }

        const accDirObj = acc[curr.refDirection][curr.objectType];
        const thisTypeObjs = existing[key as keyof flows.Flow];

        if (!(thisTypeObjs && Array.isArray(thisTypeObjs))) {
          return acc;
        }

        const objToPush = (thisTypeObjs as any[]).find(
          (obj) =>
            obj.flowObject?.refDirection === curr.refDirection &&
            obj.id === curr.objectID
        );

        if (!objToPush) {
          return acc;
        }

        if (curr.objectType === 'plan') {
          objToPush.name = objToPush.planVersion.name;
        } else if (curr.objectType === 'project' && objToPush.projectVersions) {
          objToPush.name = objToPush.projectVersions.find(
            (ver: projectVersions.ProjectVersion) =>
              ver.id === objToPush.currentPublishedVersionId
          ).name;
        } else if (curr.objectType === 'governingEntity') {
          objToPush.name = objToPush.governingEntityVersion.name;
        }

        accDirObj.push(objToPush);

        return acc;
      }, initialFlowDirs);
    }, [existing]),
    resolver: async (data, context) => {
      const { source, destination, ...values } = data;

      const flow = {
        ...values,
        flowObjects: Object.values(source)
          .concat(Object.values(destination))
          .flat()
          .map((flow) => flow.flowObject),
      };

      return {
        values: { flow },
        errors: {},
      };
    },
  });

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit((data) => console.log(data))}
          >
            <Grid container spacing={3} sx={{ marginY: 4 }}>
              <Grid item xs={12} sx={{ marginBottom: 2 }}>
                <Typography variant="h1" sx={{ marginBottom: 2 }}>
                  {isExistingFlow
                    ? `${t.get(lang, (s) => s.routes.editFlow.title)} ${
                        existing.id
                      }, v${existing.versionID}`
                    : t.get(lang, (s) => s.routes.newFlow.title)}
                </Typography>
                {existing?.createdAt && (
                  <Typography variant="body2" sx={{ marginY: 1 }}>
                    {t
                      .get(
                        lang,
                        (s) => s.components.forms.newEditFlow.createdAt
                      )
                      .replace(
                        '{date}',
                        new Intl.DateTimeFormat(lang, {
                          dateStyle: 'long',
                        }).format(new Date(existing.createdAt))
                      )
                      .replace(
                        '{author}',
                        existing?.createdBy?.name ||
                          t.get(lang, (s) => s.user.ftsUser)
                      )}
                  </Typography>
                )}
                {existing?.updatedAt && (
                  <Typography variant="body2">
                    {t
                      .get(
                        lang,
                        (s) => s.components.forms.newEditFlow.updatedAt
                      )
                      .replace(
                        '{date}',
                        new Intl.DateTimeFormat(lang, {
                          dateStyle: 'long',
                        }).format(new Date(existing.updatedAt))
                      )
                      .replace(
                        '{author}',
                        existing?.lastUpdatedBy?.name ||
                          t.get(lang, (s) => s.user.ftsUser)
                      )}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sx={{ marginBottom: 1 }}>
                <Typography variant="h2">
                  {t.get(lang, (s) => s.components.forms.newEditFlow.funding)}
                </Typography>
              </Grid>
              <Grid item xs={12} lg={6}>
                <FormNewEditFlowObjects
                  refDirection="source"
                  label={t.get(
                    lang,
                    (s) => s.components.forms.newEditFlow.sources
                  )}
                />
              </Grid>
              <Grid item xs={12} lg={6}>
                <FormNewEditFlowObjects
                  refDirection="destination"
                  label={t.get(
                    lang,
                    (s) => s.components.forms.newEditFlow.destinations
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      )}
    </AppContext.Consumer>
  );
}