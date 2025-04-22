const HOME = '/';
const ROOT = '/*';
const SPLAT = '*';
const FLOWS = '/flows';
const FLOW = `${FLOWS}/:id/:version`;
const ADD_FLOW = `${FLOWS}/add`;
const PENDING_FLOWS = '/pending-flows';
const ORGANIZATIONS = '/organizations';
const ORGANIZATION = `${ORGANIZATIONS}/:id`;
const ADD_ORGANIZATION = `${ORGANIZATIONS}/add`;
const KEYWORDS = '/keywords';
const UPLOAD_XLSX = '/upload-xlsx';

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
 * `/flows/:id/:version`
 */
export const flow = (id: number, version: number) =>
  replacePlaceholders(FLOW, { id, version });

/**
 * `/flows/:id/:version/*`
 */
export const flowRoot = () => FLOW + ROOT;

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
 * `/keywords`
 */
export const keywords = () => replacePlaceholders(KEYWORDS, {});

/**
 * `/upload-xlsx`
 */
export const uploadXLSX = () => replacePlaceholders(UPLOAD_XLSX, {});

export default {
  home,
  splat,
  flows,
  addFlow,
  flow,
  flowRoot,
  pendingFlows,
  organizations,
  organization,
  organizationRoot,
  addOrganization,
  keywords,
  uploadXLSX,
};
