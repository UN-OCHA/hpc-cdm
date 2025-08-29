import { Box, LinearProgress, Typography } from '@mui/material';
import tw from 'twin.macro';

const LinearProgressWithLabel = (
  props:
    | { title: string; progress: number }
    | {
        title: string;
        processed: number;
        total: number;
        shouldShowProcess?: boolean;
      }
) => {
  const progress =
    'progress' in props
      ? props.progress
      : props.total > 0
        ? (props.processed / props.total) * 100
        : 0;

  const ProcessLabel = () =>
    'processed' in props && props.shouldShowProcess ? (
      <Typography variant="body2" sx={tw`text-sm text-unocha-textLight`}>
        {`${props.processed} / ${props.total}`}
      </Typography>
    ) : null;

  return (
    <Box sx={tw`flex items-center gap-x-4 mt-4`}>
      <span>{props.title}</span>
      <Box sx={tw`flex-grow`}>
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, progress))}
          sx={tw`h-2 rounded-sm`}
        />
      </Box>
      <Box sx={tw`min-w-fit flex flex-col items-end text-right`}>
        <Typography
          variant="body2"
          sx={tw`text-sm font-medium text-unocha-textLight`}
        >
          {`${Math.round(progress)}%`}
        </Typography>
        <ProcessLabel />
      </Box>
    </Box>
  );
};

export default LinearProgressWithLabel;
