import React, { createContext, useReducer, Dispatch } from 'react';
import { InitialStateType, FormActions, formReducer } from './reducer';
import { forms } from '@unocha/hpc-data';

const initialState = {
  form: undefined,
  data: {},
  // files: []
};

const EnketoFormContext = createContext<{
  state: InitialStateType;
  dispatch: Dispatch<FormActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

interface Props {
  form: forms.Form;
  submission: forms.FormSubmission | null;
  children: JSX.Element | JSX.Element[];
}

const EnketoFormContextProvider = (props: Props) => {
  const { form } = props;
  const data = props.submission ? props.submission.data : {};
  const [state, dispatch] = useReducer(formReducer, { form, data });

  return (
    <EnketoFormContext.Provider value={{ state, dispatch }}>
      {props.children}
    </EnketoFormContext.Provider>
  );
};

export { EnketoFormContextProvider, EnketoFormContext };
