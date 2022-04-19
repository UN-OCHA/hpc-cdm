import React, { useContext } from 'react';

import { t } from '../../i18n';
import { C, ICONS } from '@unocha/hpc-ui';
import { operations } from '@unocha/hpc-data';

import * as paths from '../paths';
import { AppContext } from '../context';
import { useLocation } from 'react-router-dom';

interface Props {
  operation: operations.DetailedOperation;
  cluster: operations.OperationCluster;
  showSettingsButton?: boolean;
  breadcrumbs?: Array<{
    label: string;
    to: string;
  }>;
}

const ClusterNavitation = (props: Props) => {
  const loc = useLocation();

  const { breadcrumbs, operation, cluster, showSettingsButton } = props;
  const { lang } = useContext(AppContext);

  const settingsPath = paths.operationClusterSettings({
    operationId: operation.id,
    clusterId: cluster.id,
  });

  const displaySettings =
    showSettingsButton && cluster.permissions.canModifyAccess;

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
        ...(breadcrumbs || []),
      ]}
      actions={
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {displaySettings && (
            <C.ButtonLink
              color="neutral"
              text={t.t(lang, (s) => s.routes.operations.clusters.settings)}
              to={settingsPath}
              active={loc.pathname.startsWith(settingsPath)}
              startIcon={ICONS.Gear}
            />
          )}
        </>
      }
    />
  );
};

export default ClusterNavitation;
