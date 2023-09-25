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
  defaultChecked,
  ...otherProps
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
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
        name="includeChildrenOfParkedFlows"
        size={size}
        defaultChecked={defaultChecked}
      />
    ),
  };
  return <FormControlLabel {...configCheckBox} />;
};

CheckBox.defaultProps = {
  size: 'medium',
};
export default CheckBox;
