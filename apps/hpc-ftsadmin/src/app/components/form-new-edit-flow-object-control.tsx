import { C } from '@unocha/hpc-ui';
import { useCallback } from 'react';
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
  inputRef?: React.RefObject<HTMLInputElement>;
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
  const { control, watch, getFieldState, formState } = useFormContext();
  const name = `${refDirection}.${objectType}`;
  const watchField = watch(name);

  const getOptionLabel = useCallback(
    (option) => option[optionLabel],
    [optionLabel]
  );

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
              fullWidth
              multiple
              autoHighlight
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { error } = getFieldState(
                    `${name}.id${option.id}`,
                    formState
                  );
                  return (
                    <C.ValidatedChip
                      {...getTagProps({ index })}
                      label={getOptionLabel(option)}
                      sx={{ maxWidth: '440px!important' }}
                      state={error ? 'error' : 'default'}
                      strings={{
                        error:
                          error &&
                          t
                            .get(
                              lang,
                              (s) =>
                                s.components.forms.newEditFlow.hints.invalidTag
                            )
                            .replace('{item}', getOptionLabel(option))
                            .replace(
                              '{validOptions}',
                              (
                                error as unknown as { options: unknown[] }
                              ).options
                                .map((validOption) =>
                                  typeof validOption === 'number'
                                    ? validOption
                                    : getOptionLabel(validOption)
                                )
                                .join('; ')
                            ),
                      }}
                    />
                  );
                })
              }
              getOptionLabel={getOptionLabel}
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
