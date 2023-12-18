import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import { categories } from '@unocha/hpc-data';
import { useField, useFormikContext, ErrorMessage } from 'formik';
import CloseIcon from '@mui/icons-material/Close';
import tw from 'twin.macro';

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
const StyledIconButton = tw(IconButton)`
  me-6`;

const FormikError = ({ name }: { name: string }) => (
  <ErrorMessage name={name}>
    {(msg) => <div style={{ color: 'red', marginTop: '0.5rem' }}>{msg}</div>}
  </ErrorMessage>
);

const AsyncSingleSelect = ({
  name,
  label,
  fnPromise,
  category,
  hasNameValue,
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
  hasNameValue?: boolean;
}) => {
  const { setFieldValue } = useFormikContext<string>();
  const [field, meta, helpers] = useField(name);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<
    readonly { label: string; id: number }[]
  >([]);
  const loading = open && options.length === 0;

  const onBlur = useCallback(() => helpers.setTouched(true), [helpers]);
  const errorMsg = useMemo(
    () =>
      meta.touched && Boolean(meta.error)
        ? meta.touched && (meta.error as string)
        : null,
    [meta.touched, meta.error]
  );

  useEffect(() => {
    if (!loading) {
      return undefined;
    }
    (async () => {
      try {
        const response = await fnPromise({ query: category });
        const parsedResponse = response.map((responseValue: any) => {
          return { label: responseValue.name, id: responseValue.id };
        });
        setOptions(parsedResponse);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [loading]);
  const handleChange = (event: SelectChangeEvent<number>) => {
    const {
      target: { value },
    } = event;
    setFieldValue(name, value);
  };
  const singleSelectConfig: SelectProps<number> = {
    ...field,
    ...otherProps,
    labelId: `${label.toLowerCase().replace(' ', '-').trim()}-label`,
    onChange: handleChange,
    input: (
      <OutlinedInput
        onBlur={onBlur}
        error={!!errorMsg}
        value={field.value}
        endAdornment={
          <CircularProgressBox>
            {field.value !== '' && (
              <StyledIconButton
                onClick={() => setFieldValue(name, '')}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </StyledIconButton>
            )}
            {loading ? (
              <CircularProgress sx={tw`me-6`} color="inherit" size={20} />
            ) : null}
          </CircularProgressBox>
        }
        id="select-single-chip"
        label={label}
      />
    ),
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    size: 'small',
  };

  // useEffect(() => {
  //   if (options.length > 0) {
  //     console.log('@@@@2')
  //     helpers.setValue(field.value);
  //   }
  // }, [options, field]);

  if (meta && meta.touched && meta.error) {
    singleSelectConfig.error = true;
  }
  return (
    <FormControl sx={{ width: '100%' }} size="small">
      <InputLabel id={`${label.toLowerCase().replace(' ', '-').trim()}-label`}>
        {label}
      </InputLabel>
      <StyledSelect {...singleSelectConfig}>
        {options.length > 0 ? (
          options.map((value) => (
            <MenuItem
              key={value.id}
              value={hasNameValue ? value.label : value.id}
            >
              {value.label}
            </MenuItem>
          ))
        ) : (
          <Loading disabled value="">
            Loading...
          </Loading>
        )}
      </StyledSelect>
      <FormikError name={name} />
    </FormControl>
  );
};
export default AsyncSingleSelect;
