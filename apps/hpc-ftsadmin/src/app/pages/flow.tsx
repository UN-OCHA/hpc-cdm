import { Redirect, Route, Switch } from 'react-router-dom';

import { C, dataLoader } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import * as paths from '../paths';

import EditFlow from './edit-flow';

interface Props {
  match: {
    params: {
      id: string;
    };
  };
}

const PageFlow = (props: Props) => {
  const id = parseInt(props.match.params.id);
  const loader = dataLoader([{ id }], getEnv().model.flows.getFlow);

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <C.Loader
          loader={loader}
          strings={{
            ...t.get(lang, (s) => s.components.loader),
            notFound: {
              ...t.get(lang, (s) => s.components.notFound),
              ...t.get(lang, (s) => s.routes.flows.notFound),
            },
          }}
        >
          {(flow) => {
            return (
              <Switch>
                <Route exact path={paths.flow(id)}>
                  <Redirect to={paths.editFlow(id)} />
                </Route>
                <Route path={paths.editFlow(id)}>
                  <EditFlow flow={flow} />
                </Route>
                <Route>
                  <C.NotFound
                    strings={t.get(lang, (s) => s.components.notFound)}
                  />
                </Route>
              </Switch>
            );
          }}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
};

export default PageFlow;
