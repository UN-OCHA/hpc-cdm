export const isDefined = <T>(v: T | null | undefined): v is T =>
  v !== null && v !== undefined;

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
