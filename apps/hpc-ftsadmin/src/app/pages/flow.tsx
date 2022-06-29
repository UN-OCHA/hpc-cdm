import { Redirect, Route, Switch } from 'react-router-dom';

import { C } from '@unocha/hpc-ui';

import { t } from '../../i18n';
import { AppContext } from '../context';
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
  return (
    <AppContext.Consumer>
      {({ lang }) => {
        return (
          <Switch>
            <Route exact path={paths.flow(id)}>
              <Redirect to={paths.editFlow(id)} />
            </Route>
            <Route path={paths.editFlow(id)}>
              <EditFlow />
            </Route>
            <Route>
              <C.NotFound strings={t.get(lang, (s) => s.components.notFound)} />
            </Route>
          </Switch>
        );
      }}
    </AppContext.Consumer>
  );
};

export default PageFlow;
