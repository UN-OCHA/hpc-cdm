import { reportingWindows } from '@unocha/hpc-data';
import { ActionMap } from '../../utils/types';
import merge from 'lodash/merge';
import XForm from './xform';

export enum Types {
  UpdateData = 'UPDATE_DATA',
  UpdateXForm = 'UPLOAD_XFORM',
}

type FormPayload = {
  [Types.UpdateData]: {
    data: any;
  };
  [Types.UpdateXForm]: {
    xform: XForm;
  };
};

export type FormActions = ActionMap<FormPayload>[keyof ActionMap<FormPayload>];

export type StateType = {
  reportingWindowId: number | undefined;
  assignment: reportingWindows.GetAssignmentResult | undefined;
  xform: XForm | undefined;
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
    case Types.UpdateXForm: {
      const { xform } = action.payload;
      return { ...state, xform };
    }
    default:
      return state;
  }
};
