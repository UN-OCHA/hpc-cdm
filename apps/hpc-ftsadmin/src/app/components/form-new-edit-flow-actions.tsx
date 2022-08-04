import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Icon,
  Tooltip,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { MdInfoOutline } from 'react-icons/md';
import { t } from '../../i18n';
import { AppContext } from '../context';

export default function FormNewEditFlowActions() {
  const boxStyling = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 1,
  };

  const { control } = useFormContext();

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <>
          <Box sx={boxStyling}>
            <Controller
              name="restricted"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  <FormControlLabel
                    control={<Checkbox checked={value} onChange={onChange} />}
                    label={t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.fields.restrictedInternal
                    )}
                  />
                  <Tooltip
                    placement="left"
                    title={t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.hints.restrictedTooltip
                    )}
                  >
                    <Icon sx={{ display: 'flex' }}>
                      <MdInfoOutline />
                    </Icon>
                  </Tooltip>
                </>
              )}
            />
          </Box>
          <Box sx={boxStyling}>
            <Controller
              name="isErrorCorrection"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControlLabel
                  control={<Checkbox checked={value} onChange={onChange} />}
                  label={t.get(
                    lang,
                    (s) => s.components.forms.newEditFlow.fields.errorCorrection
                  )}
                />
              )}
            />
            <Button
              type="submit"
              variant="outlined"
              size="large"
              sx={{ marginRight: 1 }}
            >
              {t.get(
                lang,
                (s) => s.components.forms.newEditFlow.saveAndViewAll
              )}
            </Button>
            <Button type="submit" variant="contained" size="large">
              {t.get(lang, (s) => s.components.forms.newEditFlow.save)}
            </Button>
          </Box>
        </>
      )}
    </AppContext.Consumer>
  );
}
