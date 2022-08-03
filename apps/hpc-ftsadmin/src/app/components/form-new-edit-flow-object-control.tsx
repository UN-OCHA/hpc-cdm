import { C } from '@unocha/hpc-ui';
import { Controller, useFormContext } from 'react-hook-form';
import { t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { AppContext } from '../context';

export interface FormNewEditFlowObjectControlProps<T> {
  objectType: string;
  refDirection: string;
  label: (s: Strings) => string;
  searchOnType?: boolean;
  overlap?: boolean;
  getOptions: (params: any) => Promise<T[]>;
  optionLabel?: keyof T;
}

export default function FormNewEditFlowObjectControl<T>(
  props: FormNewEditFlowObjectControlProps<T>
) {
  const {
    refDirection,
    objectType,
    label,
    overlap,
    optionLabel = 'name',
    ...otherProps
  } = props;
  const { control, watch } = useFormContext();
  const name = `${refDirection}.${objectType}`;
  const watchField = watch(name);

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <C.AutocompleteAsync
              strings={{
                ...t.get(lang, (s) => s.components.forms.autocomplete),
                label: t.get(lang, label),
                ...(watchField &&
                  watchField.length > 1 && {
                    helperText: t.get(
                      lang,
                      (s) =>
                        s.components.forms.newEditFlow.hints[
                          overlap ? 'overlap' : 'shared'
                        ]
                    ),
                  }),
              }}
              ChipProps={{
                sx: { maxWidth: '440px!important' },
              }}
              fullWidth
              multiple
              autoHighlight
              getOptionLabel={(option) => option[optionLabel]}
              onChange={(event, value) =>
                onChange(
                  value.map((arrItem) => ({
                    ...arrItem,
                    flowObject: {
                      refDirection,
                      objectType,
                      objectID: arrItem.id,
                    },
                  }))
                )
              }
              value={value}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              {...otherProps}
            />
          )}
        />
      )}
    </AppContext.Consumer>
  );
}
