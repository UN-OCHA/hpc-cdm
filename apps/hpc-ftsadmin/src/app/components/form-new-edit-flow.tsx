import { Grid, Typography } from '@mui/material';
import { flows } from '@unocha/hpc-data';
import { t } from '../../i18n';
import { useForm, FormProvider } from 'react-hook-form';
import { AppContext } from '../context';
import FormNewEditFlowObjectControl from './form-new-edit-flow-object-control';

interface Props {
  existing?: flows.Flow;
}

export default function FormNewEditFlow(props: Props) {
  const { existing } = props;
  const isExistingFlow = !!existing;
  const formMethods = useForm({
    defaultValues: {
      source: {
        organizations: [],
      },
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
              <Grid item xs={12}>
                <FormNewEditFlowObjectControl refDirection="source" />
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      )}
    </AppContext.Consumer>
  );
}
