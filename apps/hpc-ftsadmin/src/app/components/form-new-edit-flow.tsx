import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';

import { t } from '../../i18n';
import { AppContext } from '../context';
import ExchangeRateCalculator from './exchange-rate-calculator';
import FormNewEditFlowObjects from './form-new-edit-flow-objects';

export default function FormNewEditFlow() {
  const { handleSubmit, control } = useForm();

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
                name="source"
                control={control}
                label={t.get(
                  lang,
                  (s) => s.components.forms.newEditFlow.sources
                )}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <FormNewEditFlowObjects
                name="destination"
                control={control}
                label={t.get(
                  lang,
                  (s) => s.components.forms.newEditFlow.destinations
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider flexItem sx={{ marginY: 6 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h2">
                {t.get(lang, (s) => s.components.forms.newEditFlow.flow)}
              </Typography>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Controller
                name="flowType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.flowType
                    )}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                name="flowStatus"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.flowStatus
                    )}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                name="flowDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.flowDate
                    )}
                    inputFormat="DD/MM/YYYY"
                    renderInput={(params) => <TextField {...params} />}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              {/* TODO: controller */}
              <ExchangeRateCalculator
                strings={{
                  ...t.get(lang, (s) => s.components.exchangeRateCalculator),
                }}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Controller
                name="fundingFlowDescription"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.fields
                          .fundingFlowDescription
                    )}
                    placeholder={t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.placeholders
                          .fundingFlowDescription
                    )}
                    multiline
                    minRows={8}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                name="firstReported"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.firstReported
                    )}
                    inputFormat="DD/MM/YYYY"
                    renderInput={(params) => <TextField {...params} />}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                name="decisionDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.decisionDate
                    )}
                    inputFormat="DD/MM/YYYY"
                    renderInput={(params) => <TextField {...params} />}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                name="donorBudgetYear"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label={t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.fields.donorBudgetYear
                    )}
                    inputFormat="YYYY"
                    renderInput={(params) => <TextField {...params} />}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                name="newMoney"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControl margin="dense">
                    <FormControlLabel
                      control={<Checkbox />}
                      label={t.get(
                        lang,
                        (s) => s.components.forms.newEditFlow.fields.newMoney
                      )}
                      onChange={onChange}
                      value={value}
                    />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Controller
                name="contributionType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.fields.contributionType
                    )}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                name="gbEarmarking"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.gbEarmarking
                    )}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
              <Controller
                name="aidModality"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.aidModality
                    )}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
              <Controller
                name="keywords"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.keywords
                    )}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
              <Controller
                name="beneficiaryGroup"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.fields.beneficiaryGroup
                    )}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label={t.get(
                      lang,
                      (s) => s.components.forms.newEditFlow.fields.notes
                    )}
                    multiline
                    minRows={4}
                    onChange={onChange}
                    value={value}
                  />
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
