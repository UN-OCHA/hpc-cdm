import React, { useContext } from 'react';

import { Dialog, DialogContent, DialogActions } from '@mui/material';
import { MdEmail as _MdEmail } from 'react-icons/md';
import { C, styled, THEME } from '@unocha/hpc-ui';

import { AppContext } from '../../../context';
import { t } from '../../../../i18n';
import { reportingWindows } from '@unocha/hpc-data';

interface Props {
  showAssignedUsers: boolean;
  closeAssignedUsers: () => void;
  assignment: reportingWindows.GetAssignmentResult;
}

const AssignedUsersListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserLink = styled.a`
  color: ${(p) => p.theme.colors.secondary.normal};
`;

const UserTitle = styled.h3`
  color: ${(p) => p.theme.colors.text};
  text-align: center;
`;

const UserText = styled.span`
  color: ${(p) => p.theme.colors.text};
  margin: 0.25rem;
`;

const MdEmail = styled(_MdEmail)`
  margin: 0 0.5rem;
`;

const AssignedUsersModal = (props: Props) => {
  const { lang } = useContext(AppContext);
  const { showAssignedUsers, closeAssignedUsers, assignment } = props;
  return (
    <Dialog
      open={showAssignedUsers}
      onClose={closeAssignedUsers}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <UserTitle id="alert-dialog-title">
        {t.t(lang, (s) => s.routes.operations.forms.assignedUsers.title)}
      </UserTitle>

      <DialogContent id="alert-dialog-description">
        {assignment.assignedUsers.map((user, i) => (
          <UserLink key={i} href={`mailto:${user.email}`}>
            <AssignedUsersListItem key={user.email}>
              <UserText>{user.name || user.email}</UserText>
              <MdEmail size={20} color={THEME.colors.pallete.orange.normal} />
            </AssignedUsersListItem>
          </UserLink>
        ))}
      </DialogContent>

      <DialogActions>
        <C.Button onClick={closeAssignedUsers} color="primary" autoFocus>
          <span>{t.t(lang, (s) => s.routes.operations.forms.nav.close)}</span>
        </C.Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignedUsersModal;
