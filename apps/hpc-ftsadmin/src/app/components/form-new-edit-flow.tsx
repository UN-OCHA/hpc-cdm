import { Grid, Typography } from '@mui/material';
import { flows } from '@unocha/hpc-data';
import { t } from '../../i18n';
import { AppContext } from '../context';

interface Props {
  existing?: flows.Flow;
}

export default function FormNewEditFlow(props: Props) {
  const { existing } = props;
  const isExistingFlow = !!existing;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
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
                  .get(lang, (s) => s.components.forms.newEditFlow.createdAt)
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
                  .get(lang, (s) => s.components.forms.newEditFlow.updatedAt)
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
        </Grid>
      )}
    </AppContext.Consumer>
  );
}
