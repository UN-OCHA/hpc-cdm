import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import { categories } from '@unocha/hpc-data';
import { useField, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { FormObjectValue } from './types/types';

const StyledSelect = tw(Select)`
  min-w-[10rem]
  w-full
`;
const Loading = tw(MenuItem)`
text-unocha-pallete-gray
  opacity-75!
`;
const CircularProgressBox = tw.div`
  flex
  items-center
  w-fit
  h-full
`;
const AsyncMultiSelect = ({
  name,
  label,
  placeholder,
  fnPromise,
  category,
  ...otherProps
}: {
  name: string;
  label: string;
  fnPromise: ({
    query,
  }: {
    query: string;
  }) => Promise<categories.GetCategoriesResult>;
  category: categories.CategoryGroup;
  placeholder?: string;
}) => {
  const [field, meta] = useField<Array<FormObjectValue>>(name);
  const [open, setOpen] = useState(false);
  const { setFieldValue } = useFormikContext<Array<FormObjectValue>>();
  const [options, setOptions] = useState<Array<FormObjectValue>>([]);

  const loading = open && options.length === 0;

  useEffect(() => {
    if (!loading) {
      return undefined;
    }
    (async () => {
      try {
        const response = await fnPromise({ query: category });
        const parsedResponse = response.map(
          (responseValue): FormObjectValue => {
            return {
              displayLabel: responseValue.name,
              value: responseValue.id,
            };
          }
        );
        setOptions(parsedResponse);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [loading]);

  const handleChange = (event: SelectChangeEvent<Array<FormObjectValue>>) => {
    const {
      target: { value },
    } = event;
    if (typeof value !== 'string') {
      const testValue = options.filter((a) =>
        value.some((b) => a.value === b.value)
      );
      if (testValue) {
        setFieldValue(
          name,
          testValue.map((a) => a.value)
        );
      }
    }
  };

  const multiSelectConfig: SelectProps<Array<FormObjectValue>> = {
    ...field,
    ...otherProps,
    multiple: true,
    labelId: `${label.toLowerCase().replace(' ', '-').trim()}-label`,
    placeholder: placeholder,
    size: 'small',
    onChange: handleChange,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    input: (
      <OutlinedInput
        endAdornment={
          <CircularProgressBox>
            {loading ? (
              <CircularProgress sx={tw`me-6`} color="inherit" size={20} />
            ) : null}
          </CircularProgressBox>
        }
        id="select-multiple-chip"
        label={label}
      />
    ),
    renderValue: (selected) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((value) => (
          <Chip key={value.value} label={value.displayLabel} />
        ))}
      </Box>
    ),
  };
  if (meta && meta.touched && meta.error) {
    multiSelectConfig.error = true;
  }

  return (
    <FormControl sx={{ width: '100%' }} size="small">
      <InputLabel id={`${label.toLowerCase().replace(' ', '-').trim()}-label`}>
        {label}
      </InputLabel>
      <StyledSelect {...multiSelectConfig}>
        {options.length > 0 ? (
          options.map((value) => (
            <MenuItem key={value.value} value={value.value}>
              {value.displayLabel}
            </MenuItem>
          ))
        ) : (
          <Loading disabled value="">
            Loading...
          </Loading>
        )}
      </StyledSelect>
      <FormHelperText>{multiSelectConfig.error && meta.error}</FormHelperText>
    </FormControl>
  );
};

export default AsyncMultiSelect;
