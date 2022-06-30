import {
  Alert,
  AlertTitle,
  IconButton,
  Skeleton,
  SkeletonProps,
} from '@mui/material';
import { ReactElement } from 'react';
import { MdReplay } from 'react-icons/md';
import { DataLoaderState } from '../util';

interface Props<T> {
  children: (
    data: T,
    actions: {
      updateLoadedData: (data: T) => void;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => ReactElement<any, any>;
  skeletonProps?: SkeletonProps;
  loader: DataLoaderState<T>;
  strings: {
    loading: string;
    error: string;
    retry: string;
    notFound: {
      title: string;
      info: string;
    };
  };
}

export default function SkeletonLoader<T>(props: Props<T>) {
  const { children, skeletonProps, loader, strings } = props;
  return loader.type === 'success' ? (
    children(loader.data, { updateLoadedData: loader.update })
  ) : loader.type === 'error' ? (
    <Alert
      severity="error"
      action={
        <IconButton
          color="inherit"
          aria-label={strings.retry}
          onClick={loader.retry}
        >
          <MdReplay />
        </IconButton>
      }
    >
      <AlertTitle>{strings.error}</AlertTitle>
      {loader.error}
    </Alert>
  ) : loader.type === 'not-found' ? (
    <Alert severity="error">
      <AlertTitle>{strings.notFound.title}</AlertTitle>
      {strings.notFound.info}
    </Alert>
  ) : (
    <Skeleton {...skeletonProps} aria-label={strings.loading} />
  );
}
