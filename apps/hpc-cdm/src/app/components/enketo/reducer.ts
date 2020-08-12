import { reportingWindows } from '@unocha/hpc-data';
import { ActionMap } from '../../utils/types';
import merge from 'lodash/merge';

export enum Types {
  UpdateData = 'UPDATE_DATA',
  // UploadFile = 'UPLOAD_FILE',
}

type FormPayload = {
  [Types.UpdateData]: {
    data: any;
  };
  // [Types.UploadFile]: {
  //   file: any;
  // };
};

export type FormActions = ActionMap<FormPayload>[keyof ActionMap<FormPayload>];

export type StateType = {
  reportingWindowId: number | undefined;
  assignment: reportingWindows.GetAssignmentResult | undefined;
  // files: Array<any> | undefined;
};

export const formReducer = (
  state: StateType,
  action: FormActions
): StateType => {
  switch (action.type) {
    case Types.UpdateData: {
      const { data } = action.payload;
      const assignment = { task: { currentData: data } };
      return merge(state, assignment);
    }
    // case Types.UploadFile: {
    //   const { file } = action.payload;
    //   const files = state.files?.concat(file);
    //   return { ...state, files };
    // }
    default:
      return state;
  }
};
