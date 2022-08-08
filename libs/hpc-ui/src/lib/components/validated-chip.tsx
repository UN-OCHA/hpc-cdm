import { Chip, ChipProps, Tooltip } from '@mui/material';

type State = 'default' | 'error' | 'info' | 'success' | 'warning';

interface Props extends ChipProps {
  state: State;
  strings?: {
    [key in State]?: string;
  };
}

export default function ValidatedChip(props: Props) {
  const { state, strings, ...chipProps } = props;
  const chip = <Chip {...chipProps} color={state} />;
  const tooltipString = strings?.[state];

  if (tooltipString) {
    return <Tooltip title={tooltipString}>{chip}</Tooltip>;
  }

  return chip;
}
