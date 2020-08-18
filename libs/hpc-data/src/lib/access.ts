import * as t from 'io-ts';

export const ACCESS_TARGET = t.union(
  [
    t.type({
      type: t.literal('operation'),
      targetId: t.number,
    }),
    t.type({
      type: t.literal('operationCluster'),
      targetId: t.number,
    }),
  ],
  'ACCESS_TARGET'
);

export type AccessTarget = t.TypeOf<typeof ACCESS_TARGET>;

export const USER = t.type(
  {
    type: t.literal('user'),
    id: t.number,
  },
  'USER'
);

export const USER_WITH_META = t.intersection(
  [
    USER,
    t.type({
      name: t.string,
      id: t.number,
    }),
  ],
  'USER_WITH_META'
);

/**
 * TODO:
 * For now a grantee is just a person (user), but may later be extended to
 * include groups or bots.
 */
export const GRANTEE = USER;

export type Grantee = t.TypeOf<typeof GRANTEE>;

/**
 * TODO:
 * For now a grantee is just a person (user), but may later be extended to
 * include groups or bots.
 */
export const GRANTEE_WITH_META = USER_WITH_META;

export type GranteeWithMeta = t.TypeOf<typeof GRANTEE_WITH_META>;

export const GET_TARGET_ACCESS_PARAMS = t.type(
  {
    target: ACCESS_TARGET,
  },
  'GET_TARGET_ACCESS_PARAMS'
);

export type GetTargetAccessParams = t.TypeOf<typeof GET_TARGET_ACCESS_PARAMS>;

export const GET_TARGET_ACCESS_RESULT = t.type(
  {
    /**
     * The role IDs available for this target. Labels should be generated by
     * i18n.
     */
    roles: t.array(t.string),
    active: t.array(
      t.type({
        grantee: GRANTEE_WITH_META,
        role: t.string,
      })
    ),
    /**
     * Invitations that have been made for users to get access, but which haven't
     * become active yet as the user is yet to sign-in to HPC.
     */
    invites: t.array(
      t.type({
        email: t.string,
        role: t.string,
        /**
         * Who was the person that last modified this invitation
         */
        lastModifiedBy: USER_WITH_META,
      })
    ),
    auditLog: t.array(
      t.type({
        grantee: GRANTEE_WITH_META,
        actor: USER_WITH_META,
        /**
         * UNIX timestamp in milliseconds
         */
        date: t.number,
        /**
         * What was the role changed to at this point. If all access was removed,
         * then this will be an empty array.
         */
        roles: t.array(t.string),
      })
    ),
  },
  'GET_TARGET_ACCESS_RESULT'
);

export type GetTargetAccessResult = t.TypeOf<typeof GET_TARGET_ACCESS_RESULT>;

export const UPDATE_TARGET_ACCESS_PARAMS = t.type(
  {
    target: ACCESS_TARGET,
    grantee: GRANTEE,
    roles: t.array(t.string),
  },
  'UPDATE_TARGET_ACCESS_PARAMS'
);

export type UpdateTargetAccessParams = t.TypeOf<
  typeof UPDATE_TARGET_ACCESS_PARAMS
>;

export interface Model {
  getAccessForTarget(
    params: GetTargetAccessParams
  ): Promise<GetTargetAccessResult>;
  /**
   * Update the access for a specific target and grantee,
   * and return the complete updated access for the target.
   */
  updateTargetAccess(
    params: UpdateTargetAccessParams
  ): Promise<GetTargetAccessResult>;
}
