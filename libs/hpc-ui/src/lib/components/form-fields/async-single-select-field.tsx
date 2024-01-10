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
import { useField, useFormikContext } from 'formik';
import CloseIcon from '@mui/icons-material/Close';
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
const StyledIconButton = tw(IconButton)`
  me-6`;

type AsyncSingleSelectProps = {
  name: string;
  label: string;
  fnPromise: () => Promise<Array<FormObjectValue>>;
  hasNameValue?: boolean;
  returnObject?: boolean;
  preOptions?: Array<FormObjectValue>;
};

/** FIXME: Component miss-beheaving */
const AsyncSingleSelect = ({
  name,
  label,
  fnPromise,
  hasNameValue,
  returnObject,
  preOptions, //TODO: Review how to properly implement already fetch data on refresh. Most likely not working fine
  ...otherProps
}: AsyncSingleSelectProps) => {
  const { setFieldValue } = useFormikContext<string>();
  const [field, meta] = useField<string | number | FormObjectValue>(name);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Array<FormObjectValue>>([
    ...(preOptions ? preOptions : []),
  ]);
  const loading =
    open && (options.length === 0 || (preOptions && options.length === 1));
  useEffect(() => {
    if (!loading) {
      return undefined;
    }
    (async () => {
      try {
        const response = await fnPromise();
        setOptions(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [loading]);
  const handleChange = (
    event: SelectChangeEvent<string | number | FormObjectValue>
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
  const singleSelectConfig: SelectProps<string | number | FormObjectValue> = {
    ...field,
    ...otherProps,
    labelId: `${label.toLowerCase().replace(' ', '-').trim()}-label`,
    onChange: handleChange,
    input: (
      <OutlinedInput
        endAdornment={
          <CircularProgressBox>
            {field.value && (
              <StyledIconButton
                onClick={() =>
                  setFieldValue(
                    name,
                    returnObject ? { displayLabel: '', value: '' } : ''
                  )
                }
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
    <FormControl sx={{ width: '100%' }} size="small">
      <InputLabel id={`${label.toLowerCase().replace(' ', '-').trim()}-label`}>
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
                  ? value
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
    </FormControl>
  );
};
export default AsyncSingleSelect;
