import { C, CLASSES } from '@unocha/hpc-ui';
import React, { type Dispatch, type SetStateAction, useContext } from 'react';
import { AppContext } from '../../../context';

import { type reportingWindows } from '@unocha/hpc-data';
import dayjs from '../../../../libraries/dayjs';
import { type FormStatus } from '../types';
import AssignedUsersButton from './assignUsersButton';
import Indicator from './indicator';
import StatusChangeButtons from './StatusChangeButtons';

interface Props {
  isLoading: boolean;
  isEditable: boolean;
  reportingWindow: reportingWindows.ReportingWindow;
  setShouldShowAssignedUsers: Dispatch<SetStateAction<boolean>>;
  assignment: reportingWindows.GetAssignmentResult;
  isFormTouched: boolean;
  status: FormStatus;
  setStatus: Dispatch<SetStateAction<FormStatus>>;
}

const FormToolbar = ({
  isLoading,
  isEditable,
  reportingWindow,
  setShouldShowAssignedUsers,
  assignment,
  isFormTouched,
  status,
  setStatus,
}: Props) => {
  const { lang } = useContext(AppContext);
  const { state: assignmentState } = assignment;

  const changeStatusButtonsProps = { assignment, setStatus };

  const lastUpdatedAt = dayjs(
    status.type === 'conflict' ? status.timestamp : assignment.lastUpdatedAt
  )
    .locale(lang)
    .fromNow();
  const lastUpdatedBy =
    status.type === 'conflict' ? status.otherPerson : assignment.lastUpdatedBy;

  const indicatorProps = {
    isLoading,
    isEditable,
    reportingWindow,
    isFormTouched,
    formStatus: status,
    assignmentState,
    lastUpdatedAt,
    lastUpdatedBy,
  };

  return (
    <C.Toolbar>
      {!isLoading && status.type !== 'saving' && (
        <StatusChangeButtons {...changeStatusButtonsProps} />
      )}
      <div className={CLASSES.FLEX.GROW} />
      {!isLoading && (
        <AssignedUsersButton
          setShowAssignedUsers={setShouldShowAssignedUsers}
        />
      )}
      {<Indicator {...indicatorProps} />}
    </C.Toolbar>
  );
};

export default FormToolbar;
