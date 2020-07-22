export interface ResultWithPermissions<T, P extends string> {
  data: T;
  permissions: { [key in P]: boolean };
}
