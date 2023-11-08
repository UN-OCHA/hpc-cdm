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

const AsyncSingleSelect = ({
  name,
  label,
  fnPromise,
  hasNameValue,
  ...otherProps
}: {
  name: string;
  label: string;
  fnPromise: () => Promise<{ label: string; id: string | number }[]>;
  hasNameValue?: boolean;
}) => {
  const { setFieldValue } = useFormikContext<string>();
  const [field, meta] = useField<string | number>(name);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<
    readonly { label: string; id: string | number }[]
  >([]);
  const loading = open && options.length === 0;

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
  const handleChange = (event: SelectChangeEvent<string | number>) => {
    const {
      target: { value },
    } = event;
    setFieldValue(name, value);
  };
  const singleSelectConfig: SelectProps<string | number> = {
    ...field,
    ...otherProps,
    labelId: `${label.toLowerCase().replace(' ', '-').trim()}-label`,
    onChange: handleChange,
    input: (
      <OutlinedInput
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
    </FormControl>
  );
};
export default AsyncSingleSelect;
