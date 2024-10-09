const HOME = '/';
const ROOT = '/*';
const FLOWS = '/flows';
const FLOW = `${FLOWS}/:id`;
const ADD_FLOW = `${FLOWS}/add`;
const PENDING_FLOWS = '/pending-flows';
const ORGANIZATIONS = '/organizations';
const ORGANIZATION = `${ORGANIZATIONS}/:id`;
const ADD_ORGANIZATION = `${ORGANIZATIONS}/add`;
const KEYWORDS = '/keywords';

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

export const addFlow = () => replacePlaceholders(ADD_FLOW, {});

export const pendingFlows = () => replacePlaceholders(PENDING_FLOWS, {});

export const organizations = () => replacePlaceholders(ORGANIZATIONS, {});

export const organization = (id: number) =>
  replacePlaceholders(ORGANIZATION, { id });

export const organizationRoot = () => ORGANIZATION + ROOT;

export const addOrganization = () => replacePlaceholders(ADD_ORGANIZATION, {});

export const flow = (id: number) => replacePlaceholders(FLOW, { id });

export const flowRoot = () => FLOW + ROOT;

export const keywords = () => replacePlaceholders(KEYWORDS, {});
