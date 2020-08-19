import React from 'react';

import moment from 'moment';
import { C, dataLoader, styled, CLASSES } from '@unocha/hpc-ui';
import { access } from '@unocha/hpc-data';

import { t } from '../../i18n';
import { getContext } from '../context';
import { ActionableIconButton } from './button';
import { ActionableDropdown } from './dropdown';
import { MdDelete } from 'react-icons/md';

const CLS = {
  LIST: 'access-list',
  DETAILS: 'details',
  DATE: 'date',
};

interface Props {
  target: access.AccessTarget;
}

const Wrapper = styled.div`
  .${CLS.LIST} {
    list-style: none;
    display: block;
    margin: 0;
    padding: 0;
    border: 1px solid ${(p) => p.theme.colors.panel.border};
    border-radius: ${(p) => p.theme.sizing.borderRadiusSm};
    background: ${(p) => p.theme.colors.panel.bg};

    > li {
      display: flex;
      align-items: center;
      padding: ${(p) => p.theme.marginPx.sm * 1.5}px 0;
      border-bottom: 1px solid ${(p) => p.theme.colors.panel.border};

      > span {
        margin: 0 ${(p) => p.theme.marginPx.md}px;
      }

      > .${CLS.DETAILS} {
        flex-grow: 1;
        color: ${(p) => p.theme.colors.textLight};
        font-size: ${(p) => p.theme.sizing.fontSizeSm};
      }

      > .${CLS.DATE} {
        color: ${(p) => p.theme.colors.textLight};
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }
`;

/**
 * Component for managing user access for a specific "target" (i.e. non-global),
 * such as a specific operation or operation cluster
 */
export const TargetAccessManagement = (props: Props) => {
  const { target } = props;
  const { lang, env } = getContext();

  const loader = dataLoader([target.type, target.targetId], () =>
    env().model.access.getTargetAccess({ target })
  );

  const getRoleName = (key: string) =>
    t.t(
      lang,
      (s) =>
        (s.components.accessControl.roles as { [id: string]: string })[key] ||
        key
    );

  return (
    <C.Loader
      loader={loader}
      strings={{
        ...t.get(lang, (s) => s.components.loader),
        notFound: t.get(lang, (s) => s.components.notFound),
      }}
    >
      {({ active, auditLog, invites, roles }, { updateLoadedData }) => (
        <Wrapper>
          <h3>{t.t(lang, (s) => s.components.accessControl.activePeople)}</h3>
          <ul className={CLS.LIST}>
            {active.map((item, i) => (
              <li key={i}>
                <span className={CLASSES.FLEX.GROW}>{item.grantee.name}</span>
                <ActionableDropdown
                  colors="gray"
                  loadingLabel={t.t(lang, (s) => s.common.saving)}
                  label={getRoleName(item.role)}
                  options={roles.map((role) => ({
                    key: role,
                    label: getRoleName(role),
                  }))}
                  onSelect={async (key) => {
                    if (
                      window.confirm(
                        t
                          .t(
                            lang,
                            (s) => s.components.accessControl.confirmRoleUpdate
                          )
                          .replace('{name}', item.grantee.name)
                          .replace('{role}', getRoleName(key))
                      )
                    ) {
                      const data = await env().model.access.updateTargetAccess({
                        target,
                        grantee: item.grantee,
                        roles: [key],
                      });
                      updateLoadedData(data);
                    }
                  }}
                />
                <ActionableIconButton
                  icon={MdDelete}
                  onClick={async () => {
                    if (
                      window.confirm(
                        t
                          .t(
                            lang,
                            (s) => s.components.accessControl.confirmRoleRemoval
                          )
                          .replace('{name}', item.grantee.name)
                      )
                    ) {
                      const data = await env().model.access.updateTargetAccess({
                        target,
                        grantee: item.grantee,
                        roles: [],
                      });
                      updateLoadedData(data);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
          <h3>{t.t(lang, (s) => s.components.accessControl.pendingInvites)}</h3>
          <ul className={CLS.LIST}>
            {invites.map((item, i) => (
              <li key={i}>
                <span>{item.email}</span>
                <span className={CLS.DETAILS}>
                  (
                  {t
                    .t(lang, (s) => s.components.accessControl.invitedBy)
                    .replace('{name}', item.lastModifiedBy.name)}
                  )
                </span>
                <ActionableDropdown
                  colors="gray"
                  loadingLabel={t.t(lang, (s) => s.common.saving)}
                  label={getRoleName(item.role)}
                  options={roles.map((role) => ({
                    key: role,
                    label: getRoleName(role),
                  }))}
                  onSelect={async (key) => {
                    if (
                      window.confirm(
                        t
                          .t(
                            lang,
                            (s) => s.components.accessControl.confirmRoleUpdate
                          )
                          .replace('{name}', item.email)
                          .replace('{role}', getRoleName(key))
                      )
                    ) {
                      const data = await env().model.access.updateTargetAccessInvite({
                        target,
                        email: item.email,
                        roles: [key],
                      });
                      updateLoadedData(data);
                    }
                  }}
                />
                <ActionableIconButton
                  icon={MdDelete}
                  onClick={async () => {
                    if (
                      window.confirm(
                        t
                          .t(
                            lang,
                            (s) => s.components.accessControl.confirmRoleRemoval
                          )
                          .replace('{name}', item.email)
                      )
                    ) {
                      const data = await env().model.access.updateTargetAccessInvite({
                        target,
                        email: item.email,
                        roles: [],
                      });
                      updateLoadedData(data);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
          <h3>{t.t(lang, (s) => s.components.accessControl.auditLog)}</h3>
          <ul className={CLS.LIST}>
            {auditLog.map((item, i) => {
              const m = moment(item.date);
              m.locale(lang);
              return (
                <li key={i}>
                  <span className={CLS.DATE}>{m.fromNow()}:</span>
                  <span>
                    {item.roles.length === 0
                      ? t
                          .t(
                            lang,
                            (s) =>
                              s.components.accessControl.auditLogRoleRemoval
                          )
                          .replace('{actor}', item.actor.name)
                          .replace('{grantee}', item.grantee.name)
                      : t
                          .t(
                            lang,
                            (s) => s.components.accessControl.auditLogRoleChange
                          )
                          .replace('{actor}', item.actor.name)
                          .replace('{grantee}', item.grantee.name)
                          .replace(
                            '{role}',
                            item.roles.map(getRoleName).join(', ')
                          )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Wrapper>
      )}
    </C.Loader>
  );
};

export default TargetAccessManagement;
