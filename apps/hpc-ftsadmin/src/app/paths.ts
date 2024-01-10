const HOME = '/';
const FLOWS = '/flows';
const FLOWSGRAPHQL = '/flowsGraphql';
const PENDING_FLOWS = '/pending-flows';
const NEW_FLOW = '/flows/add';
const EDIT_FLOW = '/flows/edit/:flowId/version/:versionId';

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

export const flowsGrahQl = () => replacePlaceholders(FLOWSGRAPHQL, {});

export const pendingFlows = () => replacePlaceholders(PENDING_FLOWS, {});

export const newFlow = () => replacePlaceholders(NEW_FLOW, {});

export const editFlowSetting = (flowId: number, versionId: number) =>
  replacePlaceholders(EDIT_FLOW, {
    flowId,
    versionId,
  });

export const editFlow = () => EDIT_FLOW;
