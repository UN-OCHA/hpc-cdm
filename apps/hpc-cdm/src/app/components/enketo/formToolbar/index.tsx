import React, { Dispatch, SetStateAction, useContext } from 'react';
import { C, CLASSES } from '@unocha/hpc-ui';
import { AppContext } from '../../../context';

import { reportingWindows } from '@unocha/hpc-data';
import AssignedUsersButton from './assignUsersButton';
import Indicator from './indicator';
import { FormStatus } from '../types';
import dayjs from '../../../../libraries/dayjs';
import StatusChangeButtons from './StatusChangeButtons';
import { assign } from 'lodash';
interface Props {
  loading: boolean;
  editable: boolean;
  reportingWindow: reportingWindows.ReportingWindow;
  setShowAssignedUsers: Dispatch<SetStateAction<boolean>>;
  assignment: reportingWindows.GetAssignmentResult;
  formTouched: boolean;
  formStatus: FormStatus;
  setStatus: Dispatch<SetStateAction<FormStatus>>;
}

const FormToolbar = ({
  loading,
  editable,
  reportingWindow,
  setShowAssignedUsers,
  assignment,
  formTouched,
  formStatus,
  setStatus,
}: Props) => {
  const { lang } = useContext(AppContext);
  const { state: assignmentState } = assignment;

  const changeStatusButtonsProps = { loading, assignment, setStatus, editable };

  const lastUpdatedAt = dayjs(
    formStatus.type === 'conflict'
      ? formStatus.timestamp
      : assignment.lastUpdatedAt
  )
    .locale(lang)
    .fromNow();
  const lastUpdatedBy =
    formStatus.type === 'conflict'
      ? formStatus.otherPerson
      : assignment.lastUpdatedBy;

  const indicatorProps = {
    loading,
    editable,
    reportingWindow,
    formTouched,
    formStatus,
    assignmentState,
    lastUpdatedAt,
    lastUpdatedBy,
  };

  return (
    <C.Toolbar>
      {!loading && formStatus.type !== 'saving' && (
        <StatusChangeButtons {...changeStatusButtonsProps} />
      )}
      <div className={CLASSES.FLEX.GROW} />
      {!loading && (
        <AssignedUsersButton setShowAssignedUsers={setShowAssignedUsers} />
      )}
      {<Indicator {...indicatorProps} />}
    </C.Toolbar>
  );
};

export default FormToolbar;
