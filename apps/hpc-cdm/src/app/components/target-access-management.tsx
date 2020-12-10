import React, { useState } from 'react';
import { MdClear, MdAdd } from 'react-icons/md';

import { C, dataLoader, styled } from '@unocha/hpc-ui';
import { access } from '@unocha/hpc-data';

import dayjs from '../../libraries/dayjs';

import { t } from '../../i18n';
import { getContext } from '../context';
import { TargetAccessManagementAddUser } from './target-access-management-add-user';

interface Props {
  target: access.AccessTarget;
}

const Wrapper = styled.div``;

/**
 * Component for managing user access for a specific "target" (i.e. non-global),
 * such as a specific operation or operation cluster
 */
export const TargetAccessManagement = (props: Props) => {
  const { target } = props;
  const { lang, env } = getContext();

  const [addUserOpen, setAddUserOpen] = useState(false);

  const loader = dataLoader(
    [target.type, target.type === 'global' ? null : target.targetId],
    () => env().model.access.getTargetAccess({ target })
  );

  const getRoleName = (key: string) =>
    t.t(
      lang,
      (s) =>
        (s.components.accessControl.roles as { [id: string]: string })[key] ||
        key
    );

  const getRoleNames = (keys: string[]) =>
    t.list(lang, keys.map(getRoleName), { type: 'conjunction' });

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
          <TargetAccessManagementAddUser
            target={target}
            open={addUserOpen}
            setOpen={setAddUserOpen}
            roles={roles}
            updateLoadedData={updateLoadedData}
          />
          <C.List
            title={t.t(lang, (s) => s.components.accessControl.activePeople)}
            actions={
              <C.Button
                color="secondary"
                onClick={() => setAddUserOpen(true)}
                startIcon={MdAdd}
                text={t.t(lang, (s) => s.components.accessControl.addPerson)}
              />
            }
          >
            {active.length > 0 ? (
              active.map((item, i) => {
                return (
                  <C.ListItem
                    key={i}
                    text={item.grantee.name}
                    actions={
                      <>
                        <C.ActionableDropdown
                          loadingLabel={t.t(lang, (s) => s.common.saving)}
                          label={getRoleNames(item.roles)}
                          showCheckboxes
                          options={roles.map((role) => ({
                            key: role,
                            label: getRoleName(role),
                            selected: item.roles.indexOf(role) >= 0,
                          }))}
                          onSelect={async (role) => {
                            const roles =
                              item.roles.indexOf(role) >= 0
                                ? item.roles.filter((r) => r !== role)
                                : [...item.roles, role];
                            if (
                              window.confirm(
                                t
                                  .t(
                                    lang,
                                    (s) =>
                                      s.components.accessControl
                                        .confirmRoleUpdate
                                  )
                                  .replace('{name}', item.grantee.name)
                                  .replace('{role}', getRoleNames(roles))
                              )
                            ) {
                              const data = await env().model.access.updateTargetAccess(
                                {
                                  target,
                                  grantee: item.grantee,
                                  roles,
                                }
                              );
                              updateLoadedData(data);
                            }
                          }}
                        />
                        <C.ActionableButton
                          color="neutral"
                          icon={MdClear}
                          label={t.t(
                            lang,
                            (s) => s.components.accessControl.deletePerson
                          )}
                          onClick={async () => {
                            if (
                              window.confirm(
                                t
                                  .t(
                                    lang,
                                    (s) =>
                                      s.components.accessControl
                                        .confirmRoleRemoval
                                  )
                                  .replace('{name}', item.grantee.name)
                              )
                            ) {
                              const data = await env().model.access.updateTargetAccess(
                                {
                                  target,
                                  grantee: item.grantee,
                                  roles: [],
                                }
                              );
                              updateLoadedData(data);
                            }
                          }}
                        />
                      </>
                    }
                  />
                );
              })
            ) : (
              <C.ListItem
                muted
                text={t.t(lang, (s) => s.components.accessControl.noUsers)}
              />
            )}
          </C.List>
          <C.List
            title={t.t(lang, (s) => s.components.accessControl.pendingInvites)}
          >
            {invites.length > 0 ? (
              invites.map((item, i) => {
                return (
                  <C.ListItem
                    text={item.email}
                    secondary={
                      <span>
                        {t
                          .t(lang, (s) => s.components.accessControl.invitedBy)
                          .replace('{name}', item.lastModifiedBy.name)}
                      </span>
                    }
                    actions={
                      <>
                        <C.ActionableDropdown
                          loadingLabel={t.t(lang, (s) => s.common.saving)}
                          label={getRoleNames(item.roles)}
                          showCheckboxes
                          options={roles.map((role) => ({
                            key: role,
                            label: getRoleName(role),
                            selected: item.roles.indexOf(role) >= 0,
                          }))}
                          onSelect={async (role) => {
                            const roles =
                              item.roles.indexOf(role) >= 0
                                ? item.roles.filter((r) => r !== role)
                                : [...item.roles, role];
                            if (
                              window.confirm(
                                t
                                  .t(
                                    lang,
                                    (s) =>
                                      s.components.accessControl
                                        .confirmRoleUpdate
                                  )
                                  .replace('{name}', item.email)
                                  .replace('{role}', getRoleNames(roles))
                              )
                            ) {
                              const data = await env().model.access.updateTargetAccessInvite(
                                {
                                  target,
                                  email: item.email,
                                  roles,
                                }
                              );
                              updateLoadedData(data);
                            }
                          }}
                        />
                        <C.ActionableButton
                          color="neutral"
                          icon={MdClear}
                          label={t.t(
                            lang,
                            (s) => s.components.accessControl.cancelInvite
                          )}
                          onClick={async () => {
                            if (
                              window.confirm(
                                t
                                  .t(
                                    lang,
                                    (s) =>
                                      s.components.accessControl
                                        .confirmRoleRemoval
                                  )
                                  .replace('{name}', item.email)
                              )
                            ) {
                              const data = await env().model.access.updateTargetAccessInvite(
                                {
                                  target,
                                  email: item.email,
                                  roles: [],
                                }
                              );
                              updateLoadedData(data);
                            }
                          }}
                        />
                      </>
                    }
                  />
                );
              })
            ) : (
              <C.ListItem
                muted
                text={t.t(
                  lang,
                  (s) => s.components.accessControl.noPendingInvites
                )}
              />
            )}
          </C.List>
          <C.List title={t.t(lang, (s) => s.components.accessControl.auditLog)}>
            {auditLog.length > 0 ? (
              auditLog.map((item, i) => {
                const m = dayjs(item.date).locale(lang);
                return (
                  <C.ListItem
                    prefix={m.fromNow()}
                    text={
                      item.roles.length === 0
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
                              (s) =>
                                s.components.accessControl.auditLogRoleChange
                            )
                            .replace('{actor}', item.actor.name)
                            .replace('{grantee}', item.grantee.name)
                            .replace('{role}', getRoleNames(item.roles))
                    }
                  />
                );
              })
            ) : (
              <C.ListItem
                muted
                text={t.t(
                  lang,
                  (s) => s.components.accessControl.auditLogEmpty
                )}
              />
            )}
          </C.List>
        </Wrapper>
      )}
    </C.Loader>
  );
};

export default TargetAccessManagement;
