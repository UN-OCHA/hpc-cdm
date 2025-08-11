import {
  FormControlLabel,
  type FormControlLabelProps,
  Switch as SwitchMUI,
} from '@mui/material';
import { useField } from 'formik';

type SwitchSize = 'small' | 'medium';
type SwitchColor = 'primary' | 'error' | 'success';
const Switch = ({
  name,
  label,
  size = 'medium',
  color,
}: {
  name: string;
  label?: string;
  color?: SwitchColor;
  size?: SwitchSize;
}) => {
  const [field] = useField(name);

  const configCheckBox: FormControlLabelProps = {
    ...field,
    label,
    id: name,
    control: <SwitchMUI checked={field.value} size={size} color={color} />,
  };
  return <FormControlLabel {...configCheckBox} />;
};

export default Switch;
