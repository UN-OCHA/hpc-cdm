import React, { Dispatch, SetStateAction, useContext } from 'react';
import { styled, C, THEME } from '@unocha/hpc-ui';
import { Tooltip, withStyles } from '@material-ui/core';
import { AppContext } from '../../../context';

import { t } from '../../../../i18n';

const Button = styled(C.Button)`
  margin-right: ${(p) => p.theme.marginPx.md}px;
`;
interface Props {
  setShowAssignedUsers: Dispatch<SetStateAction<boolean>>;
}

const AssignedUsersButton = ({ setShowAssignedUsers }: Props) => {
  const { lang } = useContext(AppContext);
  return (
    <>
      <Button onClick={() => setShowAssignedUsers(true)} color="primary">
        <span>
          {t.t(lang, (s) => s.routes.operations.forms.assignedUsers.title)}
        </span>
      </Button>
    </>
  );
};

export default AssignedUsersButton;
