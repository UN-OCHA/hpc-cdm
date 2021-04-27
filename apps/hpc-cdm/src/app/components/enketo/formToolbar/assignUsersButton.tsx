import React, { Dispatch, SetStateAction, useContext } from 'react';
import { styled, C, THEME } from '@unocha/hpc-ui';
import { Tooltip, withStyles } from '@material-ui/core';
import { AppContext } from '../../../context';

import { t } from '../../../../i18n';

interface Props {
  setShowAssignedUsers: Dispatch<SetStateAction<boolean>>;
}

const TOOLTIP_COLOR = THEME.colors.pallete.yellow.normal;
const OrangeTooltip = withStyles({
  tooltip: {
    backgroundColor: TOOLTIP_COLOR,
    padding: 10,
  },
  arrow: {
    color: TOOLTIP_COLOR,
  },
})(Tooltip);

const AssignedUsersToolTipText = styled.span<{ bold: boolean }>`
  font-size: 1.5rem;
  font-weight: ${(p) => (p.bold ? 'bold' : 'normal')};
  color: ${(p) => p.theme.colors.text};
  ${(p) => !p.bold && 'margin: 0 5px'};
`;

const Dot = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  bottom: -1rem;
  left: -1.5rem;
  position: relative;
  background-color: ${TOOLTIP_COLOR};
  border-radius: 2rem;
  border: 3px white solid;
  color: white;
  font-size: 2rem;
  font-weight: bolder;
`;

const AssignedUsersButton = ({ setShowAssignedUsers }: Props) => {
  const { lang } = useContext(AppContext);
  return (
    <>
      <C.Button onClick={() => setShowAssignedUsers(true)} color="primary">
        <span>
          {t.t(lang, (s) => s.routes.operations.forms.assignedUsers.title)}
        </span>
      </C.Button>
      <OrangeTooltip
        arrow
        title={
          <>
            <AssignedUsersToolTipText bold={true}>
              {t.t(
                lang,
                (s) => s.routes.operations.forms.assignedUsers.tooltip.title
              )}
            </AssignedUsersToolTipText>
            <AssignedUsersToolTipText bold={false}>
              {t.t(
                lang,
                (s) =>
                  s.routes.operations.forms.assignedUsers.tooltip.description
              )}
            </AssignedUsersToolTipText>
          </>
        }
      >
        <Dot>!</Dot>
      </OrangeTooltip>
    </>
  );
};

export default AssignedUsersButton;
