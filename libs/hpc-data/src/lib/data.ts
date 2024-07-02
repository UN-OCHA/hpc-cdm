import * as t from 'io-ts';
import { FLOW_OBJECT_TYPE } from './flowObject';
import { INPUT_SELECT_VALUE_TYPE } from './forms';
import { ORGANIZATION } from './organizations';

export const FILE_ASSET_TYPE = t.type({
  collection: t.string,
  createAt: t.string,
  filename: t.string,
  id: t.number,
  mimetype: t.string,
  originalname: t.string,
  path: t.string,
  size: t.number,
  updatedAt: t.string,
});

export const CATEGORY_TYPE = t.type({
  id: t.union([t.number, t.string]),
  value: t.union([t.string, t.number]),
  displayLabel: t.string,
  parentID: t.union([t.number, t.null]),
});
export const VERSIONS_TYPE = t.type({
  id: t.number,
  versionID: t.number,
  activeStatus: t.union([t.boolean, t.undefined]),
  isPending: t.boolean,
  isCancelled: t.boolean,
});
export const ORGANIZATION_TYPE = t.type({
  id: t.union([t.string, t.number]),
  name: t.string,
});
export const FILE_ASSET_ENTITY_TYPE = t.partial({
  collection: t.string,
  createAt: t.string,
  filename: t.string,
  id: t.number,
  mimetype: t.string,
  originalname: t.string,
  path: t.string,
  size: t.number,
  updatedAt: t.string,
});
export const REPORT_FILE_TYPE = t.partial({
  title: t.string,
  fileName: t.string,
  UploadFileUrl: t.string,
  type: t.string,
  url: t.string,
  fileAssetID: t.number,
  size: t.number,
  fileAssetEntity: FILE_ASSET_ENTITY_TYPE,
});
export const REPORT_CHANNEL_TYPE = t.type({
  group: t.string,
  id: t.union([t.string, t.number]),
  name: t.string,
});
export const FLOW_REPORT_DETAIL = t.intersection([
  t.type({
    contactInfo: t.string,
    source: t.string,
    date: t.string,
    newlyAdded: t.boolean,
    sourceID: t.null,
    refCode: t.string,
    verified: t.boolean,
    organizationID: t.union([t.string, t.number]),
    categories: t.array(t.union([t.string, t.number])),
    organization: ORGANIZATION_TYPE,
    reportFiles: t.array(REPORT_FILE_TYPE),
  }),
  t.partial({
    versionID: t.number,
  }),
]);

export const FORM_FIELD = t.type({
  id: t.union([t.string, t.number]),
  name: t.string,
  group: t.string,
});
export const CHILD_METHOD_TYPE = t.type({
  id: t.union([t.number, t.string]),
  name: t.string,
  group: t.string,
  parentID: t.union([t.number, t.string]),
});
export const INACTIVE_REASON_TYPE = t.type({
  id: t.union([t.number, t.string, t.null]),
  name: t.union([t.string, t.undefined]),
  description: t.null,
  parentID: t.null,
  code: t.null,
  group: t.string,
  includeTotals: t.null,
  createdAt: t.string,
  updatedAt: t.string,
});
export const CHILDREN_TYPE = t.type({
  childID: t.union([t.number, t.string]),
  origCurrency: t.union([t.string, t.null]),
});
export const PARENT_TYPE = t.type({
  parentID: t.union([t.number, t.string]),
  origCurrency: t.union([t.string, t.null]),
});
export const PARENTS = t.type({
  child: t.union([t.string, t.number]),
  parentID: t.union([t.number, t.string]),
});
export const PARENTS_TYPE = t.intersection([
  t.type({
    Parent: PARENT_TYPE,
    origCurrency: t.union([t.string, t.null]),
    id: t.union([t.number, t.string]),
  }),
  t.partial({
    parents: t.array(PARENTS),
    childID: t.number,
    parentID: t.number,
  }),
]);
export const DATA_TYPE = t.intersection([
  t.type({
    id: t.union([t.string, t.number, t.null]),
    versionID: t.union([t.number, t.string, t.null]),
    amountUSD: t.number,
    flowDate: t.string,
    decisionDate: t.union([t.string, t.null]),
    firstReportedDate: t.string,
    budgetYear: t.string,
    origAmount: t.union([t.number, t.null]),
    categories: t.array(t.union([t.string, CATEGORY_TYPE, t.number])),
    origCurrency: t.union([t.string, t.null]),
    exchangeRate: t.union([t.number, t.null]),
    activeStatus: t.boolean,
    restricted: t.boolean,
    newMoney: t.boolean,
    description: t.string,
    versionStartDate: t.union([t.string, t.undefined, t.null]),
    versionEndDate: t.union([t.string, t.undefined, t.null]),
    flowObjects: t.array(FLOW_OBJECT_TYPE),
    reportDetails: t.array(FLOW_REPORT_DETAIL),
    flowType: FORM_FIELD,
    keywords: t.array(FORM_FIELD),
    flowStatuses: FORM_FIELD,
    contributionTypes: FORM_FIELD,
    childMethod: t.union([t.string, CHILD_METHOD_TYPE]),
    method: FORM_FIELD,
    earmarking: t.union([FORM_FIELD, t.null]),
    isCancellation: t.union([t.boolean, t.null]),
    cancelled: t.union([t.boolean, t.null]),
    planEntities: t.union([t.boolean, t.array(t.string)]),
    planIndicated: t.union([t.boolean, t.array(t.string)]),
    isApprovedFlowVersion: t.union([t.boolean, t.null]),
    isErrorCorrection: t.union([t.boolean, t.null]),
    inactiveReason: t.array(INACTIVE_REASON_TYPE),
    rejected: t.union([t.boolean, t.null]),
    versions: t.array(VERSIONS_TYPE),
  }),
  t.partial({
    parents: t.array(PARENTS_TYPE),
    children: t.array(CHILDREN_TYPE),
    beneficiaryGroup: INPUT_SELECT_VALUE_TYPE,
    pendingStatus: t.union([t.boolean, t.array(t.string)]),
    categorySources: t.array(
      t.union([
        FORM_FIELD,
        t.union([t.string, CHILD_METHOD_TYPE]),
        t.array(FORM_FIELD),
        t.array(INACTIVE_REASON_TYPE),
        INPUT_SELECT_VALUE_TYPE,
        t.union([t.boolean, t.array(t.string)]),
        t.union([t.string, t.number]),
        t.undefined,
      ])
    ),
  }),
]);

export type dataType = t.TypeOf<typeof DATA_TYPE>;
