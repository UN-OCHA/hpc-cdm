import { forms } from '@unocha/hpc-data';

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum Types {
  UpdateData = 'UPDATE_DATA',
  UploadFile = 'UPLOAD_FILE',
}

type FormPayload = {
  [Types.UpdateData]: {
    data: any;
  };
  [Types.UploadFile]: {
    file: any;
  };
};

type FormActions = ActionMap<FormPayload>[keyof ActionMap<FormPayload>];

type StateType = {
  form: forms.Form | undefined;
  data: any | undefined;
  // files: Array<any> | undefined;
};

const formReducer = (state: StateType, action: FormActions): StateType => {
  switch (action.type) {
    case Types.UpdateData: {
      const { data } = action.payload;
      return { ...state, data };
    }
    // TODO
    case Types.UploadFile:
      return { ...state, files: action.payload.file };
    default:
      return state;
  }
};

export { InitialStateType, FormActions, formReducer };
