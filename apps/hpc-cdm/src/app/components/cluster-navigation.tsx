import React, { useContext } from 'react';

import { type operations } from '@unocha/hpc-data';
import { C, ICONS } from '@unocha/hpc-ui';
import { t } from '../../i18n';

import { useLocation } from 'react-router';
import { AppContext } from '../context';
import * as paths from '../paths';

interface Props {
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
  shouldShowSettingsButton?: boolean;
  breadcrumbs?: Array<{
    label: string;
    to: string;
  }>;
}

const ClusterNavigation = (props: Props) => {
  const loc = useLocation();

  const { breadcrumbs, operation, cluster, shouldShowSettingsButton } = props;
  const { lang } = useContext(AppContext);

  const settingsPath = paths.operationClusterSettings({
    operationId: operation.id,
    clusterId: cluster.id,
  });

  const shouldDisplaySettings =
    shouldShowSettingsButton && cluster.permissions.canModifyAccess;

  return (
    <C.TertiaryNavigation
      breadcrumbs={[
        {
          label: cluster.name,
          to: paths.operationCluster({
            operationId: operation.id,
            clusterId: cluster.id,
          }),
        },
        ...(breadcrumbs ?? []),
      ]}
      actions={
        shouldDisplaySettings ? (
          <C.ButtonLink
            color="neutral"
            text={t.t(lang, (s) => s.routes.operations.clusters.settings)}
            to={settingsPath}
            isActive={loc.pathname.startsWith(settingsPath)}
            startIcon={ICONS.Gear}
          />
        ) : undefined
      }
    />
  );
};

export default ClusterNavigation;
