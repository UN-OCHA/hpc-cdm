import {
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
} from '@mui/material';
import { useField } from 'formik';

const CheckBox = ({
  name,
  label,
  size,
  ...otherProps
}: {
  name: string;
  label: string;
  size?: 'small' | 'medium';
}) => {
  const [field, meta] = useField(name);

  const configCheckBox: FormControlLabelProps = {
    ...field,
    ...otherProps,
    label: label,
    id: name,
    control: (
      <Checkbox
        checked={field.value}
        name="includeChildrenOfParkedFlows"
        size={size}
      />
    ),
  };
  return <FormControlLabel {...configCheckBox} />;
};

CheckBox.defaultProps = {
  size: 'medium',
};
export default CheckBox;
