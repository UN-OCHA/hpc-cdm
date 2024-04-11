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
import CloseIcon from '@mui/icons-material/Close';
import { useField, useFormikContext, ErrorMessage } from 'formik';
import InputEntry from './input-entry';
import { forms } from '@unocha/hpc-data';
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
const StyledIconButton = tw(IconButton)`
  me-6`;

const FormikError = ({ name }: { name: string }) => (
  <ErrorMessage name={name}>
    {(msg) => <div style={{ color: 'red', marginTop: '0.5rem' }}>{msg}</div>}
  </ErrorMessage>
);

type AsyncSingleSelectProps = {
  name: string;
  label: string;
  fnPromise: () => Promise<Array<FormObjectValue>>;
  hasNameValue?: boolean;
  returnObject?: boolean;
  preOptions?: Array<FormObjectValue>;
  entryInfo?: forms.InputEntryType | null;
  rejectInputEntry?: (key: string) => void;
};

/** FIXME: Component miss-beheaving */
const AsyncSingleSelect = ({
  name,
  label,
  fnPromise,
  hasNameValue,
  returnObject,
  preOptions, //TODO: Review how to properly implement already fetch data on refresh. Most likely not working fine
  entryInfo,
  rejectInputEntry,
  ...otherProps
}: AsyncSingleSelectProps) => {
  const { setFieldValue } = useFormikContext<string>();
  const [field, meta, helpers] = useField<FormObjectValue | string | number>(
    name
  );
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Array<FormObjectValue>>([
    ...(preOptions ? preOptions : []),
  ]);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const loading =
    open && (options.length === 0 || (preOptions && options.length === 1));
  const onBlur = useCallback(() => helpers.setTouched(true), [helpers]);
  const errorMsg = useMemo(
    () =>
      meta.touched && Boolean(meta.error)
        ? meta.touched && (meta.error as string)
        : null,
    [meta.touched, meta.error]
  );

  useEffect(() => {
    if (!loading && !isInitialRender) {
      return undefined;
    }
    (async () => {
      try {
        const response = await fnPromise();
        if (response.length > 0 && field.value && returnObject) {
          setFieldValue(
            name,
            response.find(
              (value) =>
                value.value.toString() ===
                (field.value as FormObjectValue).value.toString()
            )
          );
        }
        setOptions(response);
        setIsInitialRender(false);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [loading]);
  const handleChange = (
    event: SelectChangeEvent<FormObjectValue | string | number>
  ) => {
    const {
      target: { value },
    } = event;
    if (returnObject) {
      setFieldValue(name, value);
    } else {
      setFieldValue(name, value);
    }
  };
  const singleSelectConfig: SelectProps<FormObjectValue | string | number> = {
    ...field,
    ...otherProps,
    labelId: `${label.toLowerCase().replace(' ', '-').trim()}-label`,
    onChange: handleChange,
    input: (
      <OutlinedInput
        onBlur={onBlur}
        error={!!errorMsg}
        value={(field.value as FormObjectValue).displayLabel}
        endAdornment={
          <CircularProgressBox>
            {field.value && (
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
        label={label}
      />
    ),
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    size: 'small',
  };
  if (meta && meta.touched && meta.error) {
    singleSelectConfig.error = true;
  }
  return (
    <>
      <FormControl sx={{ width: '100%' }} size="small">
        <InputLabel
          id={`${label.toLowerCase().replace(' ', '-').trim()}-label`}
        >
          {label}
        </InputLabel>
        <StyledSelect {...singleSelectConfig}>
          {options.length > 0 ? (
            options.map((value) => (
              //  TODO: Find a way to add { label:string, value:string } as value, maybe by enconding it to a string or any other method
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              <MenuItem
                key={value.value}
                value={
                  returnObject
                    ? value.displayLabel ===
                      (field.value as FormObjectValue).displayLabel
                      ? field.value
                      : value
                    : hasNameValue
                    ? value.displayLabel
                    : value.value
                }
              >
                {value.displayLabel}
              </MenuItem>
            ))
          ) : (
            <Loading disabled value="">
              Loading... {/** TODO: Add i18n support */}
            </Loading>
          )}
        </StyledSelect>
        <FormikError name={name} />
      </FormControl>
      {entryInfo && rejectInputEntry && (
        <InputEntry
          info={entryInfo}
          setValue={() => {
            setFieldValue(name, entryInfo.value);
            rejectInputEntry(name);
          }}
          rejectValue={() => {
            rejectInputEntry(name);
          }}
        />
      )}
    </>
  );
};
export default AsyncSingleSelect;
