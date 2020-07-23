export const HOME = '/';
export const OPERATIONS = '/operations';
export const OPERATION = `${OPERATIONS}/:id`;
export const ADMIN = '/admin';

export const operation = (id: number) =>
  OPERATION.replace(':id', id.toString());
