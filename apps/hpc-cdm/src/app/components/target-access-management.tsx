import React from 'react';

import { t } from '../../i18n';
import { C, dataLoader, styled, CLASSES } from '@unocha/hpc-ui';
import { access } from '@unocha/hpc-data';

import { getContext } from '../context';
import { DropdownActionable } from './dropdown';

const CLS = {
  LIST: 'access-list',
  DROPDOWN: 'dropdown',
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
      padding: ${(p) => p.theme.marginPx.sm * 1.5}px;
      padding-left: ${(p) => p.theme.marginPx.md}px;
      border-bottom: 1px solid ${(p) => p.theme.colors.panel.border};

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
    env().model.access.getAccessForTarget({ target })
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
                <DropdownActionable
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
              </li>
            ))}
          </ul>
          <h3>{t.t(lang, (s) => s.components.accessControl.pendingInvites)}</h3>
          <ul className={CLS.LIST}>
            {invites.map((item, i) => (
              <li key={i}>
                <span className={CLASSES.FLEX.GROW}>{item.email}</span>
                <DropdownActionable
                  colors="gray"
                  loadingLabel={t.t(lang, (s) => s.common.saving)}
                  label={getRoleName(item.role)}
                  options={roles.map((role) => ({
                    key: role,
                    label: getRoleName(role),
                  }))}
                  onSelect={(key) => {
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
                      return Promise.reject('err');
                    } else {
                      return Promise.resolve();
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        </Wrapper>
      )}
    </C.Loader>
  );
};

export default TargetAccessManagement;
