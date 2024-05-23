const HOME = '/';
const ROOT = '/*';
const FLOWS = '/flows';
const PENDING_FLOWS = '/pending-flows';
const ORGANIZATIONS = '/organizations';
const ORGANIZATION = `${ORGANIZATIONS}/:id`;
const ADD_ORGANIZATION = `${ORGANIZATIONS}/add`;
// const FLOW = `${FLOWS}/:id`;
const KEYWORDS = '/keywords';
const NEW_FLOW = '/flows/add';
const EDIT_FLOW = '/flows/edit/:flowId/version/:versionId';
const REWRITE_NEW_FLOW = '/flows/test/add';
const REWRITE_EDIT_FLOW = '/flows/test/edit/:flowId/version/:versionId';

const replacePlaceholders = (
  path: string,
  params: { [id: string]: string | number }
) => {
  for (const [param, value] of Object.entries(params)) {
    path = path.replace(`:${param}`, value.toString());
  }
  return path;
};

export const home = () => replacePlaceholders(HOME, {});

export const flows = () => replacePlaceholders(FLOWS, {});

export const pendingFlows = () => replacePlaceholders(PENDING_FLOWS, {});

export const organizations = () => replacePlaceholders(ORGANIZATIONS, {});

export const organization = (id: number) =>
  replacePlaceholders(ORGANIZATION, { id });

export const organizationRoot = () => ORGANIZATION + ROOT;

export const addOrganization = () => replacePlaceholders(ADD_ORGANIZATION, {});

// export const flow = (id: number) => replacePlaceholders(FLOW, { id });

export const keywords = () => replacePlaceholders(KEYWORDS, {});

export const newFlow = () => replacePlaceholders(NEW_FLOW, {});
export const copyFlow = () => replacePlaceholders(NEW_FLOW, {});

export const editFlowSetting = (flowId: number, versionId: number) =>
  replacePlaceholders(EDIT_FLOW, {
    flowId,
    versionId,
  });

export const editFlow = () => EDIT_FLOW;

export const rewriteNewFlow = () => replacePlaceholders(REWRITE_NEW_FLOW, {});
export const rewriteCopyFlow = () => replacePlaceholders(REWRITE_NEW_FLOW, {});

export const rewriteEditFlowSetting = (flowId: number, versionId: number) =>
  replacePlaceholders(REWRITE_EDIT_FLOW, {
    flowId,
    versionId,
  });

export const rewriteEditFlow = () => REWRITE_EDIT_FLOW;
