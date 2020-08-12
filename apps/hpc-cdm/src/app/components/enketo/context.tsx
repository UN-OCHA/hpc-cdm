import React, { createContext, useReducer, Dispatch } from 'react';
import { StateType, FormActions, formReducer } from './reducer';
import { reportingWindows } from '@unocha/hpc-data';

const initialState = {
  reportingWindowId: undefined,
  assignment: undefined,
  xform: undefined,
};

export const EnketoFormContext = createContext<{
  state: StateType;
  dispatch: Dispatch<FormActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

interface Props {
  reportingWindowId: number;
  assignment: reportingWindows.GetAssignmentResult;
  children: JSX.Element | JSX.Element[];
}

export const EnketoFormContextProvider = (props: Props) => {
  const { reportingWindowId, assignment, children } = props;
  const [state, dispatch] = useReducer(formReducer, {
    reportingWindowId,
    assignment,
    xform: undefined,
  });

  return (
    <EnketoFormContext.Provider value={{ state, dispatch }}>
      {children}
    </EnketoFormContext.Provider>
  );
};
