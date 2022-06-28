import { C } from '@unocha/hpc-ui';
import { Controller, useFormContext } from 'react-hook-form';
import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';

interface Props {
  refDirection: 'source' | 'destination';
}

export default function FormNewEditFlowObjectControl(props: Props) {
  const { refDirection } = props;
  const { model } = getEnv();
  const { control } = useFormContext();

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Controller
          name={`${refDirection}.organizations`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <C.AutocompleteAsync
              strings={{
                ...t.get(lang, (s) => s.components.forms.autocomplete),
                label: t.get(
                  lang,
                  (s) => s.components.forms.newEditFlow.fields.organizations
                ),
              }}
              ChipProps={{
                sx: { maxWidth: '440px!important' },
              }}
              fullWidth
              getOptions={model.organizations.getOrganizationsAutocomplete}
              getOptionLabel={(option) => option.name}
              searchOnType
              multiple
              autoHighlight
              onChange={(event, value) => onChange(value)}
              value={value}
            />
          )}
        />
      )}
    </AppContext.Consumer>
  );
}
