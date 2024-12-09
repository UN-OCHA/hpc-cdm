import { useContext } from 'react';
import {
  useNavigate,
  useLocation,
  UNSAFE_DataRouterContext,
  UNSAFE_LocationContext,
} from 'react-router';
import { type QueryParamAdapter, type PartialLocation } from 'use-query-params';

export const ReactRouter7Adapter = ({
  children,
}: {
  children: (adapter: QueryParamAdapter) => React.ReactElement | null;
}) => {
  // we need the navigator directly so we can access the current version
  // of location in case of multiple updates within a render (e.g. #233)
  // but we will limit our usage of it and have a backup to just use
  // useLocation() output in case of some kind of breaking change we miss.
  // see: https://github.com/remix-run/react-router/blob/f3d87dcc91fbd6fd646064b88b4be52c15114603/packages/react-router-dom/index.tsx#L113-L131
  const { location: unsafeLocation } = useContext(UNSAFE_LocationContext);
  const navigate = useNavigate();
  const router = useContext(UNSAFE_DataRouterContext)?.router;
  const location = useLocation();

  const adapter: QueryParamAdapter = {
    replace(location2: PartialLocation) {
      navigate(location2.search || '?', {
        replace: true,
        state: location2.state,
      });
    },
    push(location2: PartialLocation) {
      navigate(location2.search || '?', {
        replace: false,
        state: location2.state,
      });
    },
    get location() {
      return router?.state?.location ?? unsafeLocation ?? location;
    },
  };

  return children(adapter);
};
