import { Button, Grid, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import { t } from '../../i18n';
import { AppContext } from '../context';
import FormNewEditFlowObjects from './form-new-edit-flow-objects';

export default function FormNewEditFlow() {
  const useFormReturn = useForm({
    shouldUnregister: true,
  });
  const { handleSubmit } = useFormReturn;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <form onSubmit={handleSubmit((data) => console.log(data))}>
          <Grid container spacing={3} sx={{ marginY: 4 }}>
            <Grid item xs={12} sx={{ marginBottom: 2 }}>
              <Typography variant="h2">
                {t.get(lang, (s) => s.components.forms.newEditFlow.funding)}
              </Typography>
            </Grid>
            <Grid item xs={12} lg={6}>
              <FormNewEditFlowObjects
                refDirection="source"
                name="source"
                form={useFormReturn}
                label={t.get(
                  lang,
                  (s) => s.components.forms.newEditFlow.sources
                )}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <FormNewEditFlowObjects
                refDirection="destination"
                name="destination"
                form={useFormReturn}
                label={t.get(
                  lang,
                  (s) => s.components.forms.newEditFlow.destinations
                )}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit">Save</Button>
          </Grid>
        </form>
      )}
    </AppContext.Consumer>
  );
}
