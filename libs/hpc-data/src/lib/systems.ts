import * as t from 'io-ts';

const SYSTEM = t.type({
  systemID: t.string,
});

export type System = t.TypeOf<typeof SYSTEM>;

export const GET_SYSTEMS_RESULT = t.array(SYSTEM);
export type GetSystemsResult = t.TypeOf<typeof GET_SYSTEMS_RESULT>;

export interface Model {
  getSystems(): Promise<GetSystemsResult>;
}
