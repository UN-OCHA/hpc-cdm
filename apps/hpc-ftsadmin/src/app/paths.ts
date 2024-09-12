const HOME = '/';
const ROOT = '/*';
const SPLAT = '*';
const FLOWS = '/flows';
const ADD_FLOW = `${FLOWS}/add`;
const PENDING_FLOWS = '/pending-flows';
const ORGANIZATIONS = '/organizations';
const ORGANIZATION = `${ORGANIZATIONS}/:id`;
const ADD_ORGANIZATION = `${ORGANIZATIONS}/add`;
const FLOW = `${FLOWS}/:id`;
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

/**
 * `/`
 */
export const home = () => replacePlaceholders(HOME, {});

/**
 * `*`
 */
export const splat = () => SPLAT;

/**
 * `/flows`
 */
export const flows = () => replacePlaceholders(FLOWS, {});

/**
 * `/flows/add`
 */
export const addFlow = () => replacePlaceholders(ADD_FLOW, {});

/**
 * `/pending-flows`
 */
export const pendingFlows = () => replacePlaceholders(PENDING_FLOWS, {});

/**
 * `/organizations`
 */
export const organizations = () => replacePlaceholders(ORGANIZATIONS, {});

/**
 * `/organizations/:id`
 */
export const organization = (id: number) =>
  replacePlaceholders(ORGANIZATION, { id });

/**
 * `/organizations/:id/*`
 */
export const organizationRoot = () => ORGANIZATION + ROOT;

/**
 * `/organizations/add`
 */
export const addOrganization = () => replacePlaceholders(ADD_ORGANIZATION, {});

/**
 * `/flows/:id`
 */
export const flow = (id: number) => replacePlaceholders(FLOW, { id });

/**
 * `/keywords`
 */
export const keywords = () => replacePlaceholders(KEYWORDS, {});
