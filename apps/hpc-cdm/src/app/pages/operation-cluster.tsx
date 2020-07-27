import React from 'react';

import { C, styled } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { AppContext } from '../context';
import * as paths from '../paths';

const CLS = {
  CLUSTERS: 'clusters',
  ABBREVIATION: 'abbrv',
};

interface Props {
  className?: string;
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
}

const Page = (props: Props) => {
  const { operation, cluster } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div className={props.className}>
          <C.Toolbar>
            <C.Breadcrumbs
              links={[
                {
                  label: t.t(lang, (s) => s.navigation.clusters),
                  to: paths.operationClusters(operation.id),
                },
                {
                  label: cluster.name,
                  to: paths.operationCluster({
                    operationId: operation.id,
                    clusterId: cluster.id,
                  }),
                },
              ]}
            />
          </C.Toolbar>
        </div>
      )}
    </AppContext.Consumer>
  );
};

export default styled(Page)``;
