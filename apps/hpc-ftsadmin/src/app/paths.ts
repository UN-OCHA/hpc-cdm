const HOME = '/';
const FLOWS = '/flows';
const PENDING_FLOWS = '/pending-flows';
const FLOW = `${FLOWS}/:id`;
const EDIT_FLOW = `${FLOW}/edit`;

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

export const flowMatch = () => replacePlaceholders(FLOW, {});

export const flow = (id: number) => replacePlaceholders(FLOW, { id });

export const editFlow = (id: number) => replacePlaceholders(EDIT_FLOW, { id });
