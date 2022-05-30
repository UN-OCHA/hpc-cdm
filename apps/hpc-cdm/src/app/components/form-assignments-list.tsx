import { Tooltip } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { reportingWindows } from '@unocha/hpc-data';
import { C, styled } from '@unocha/hpc-ui';
import React from 'react';
import { t } from '../../i18n';
import dayjs from '../../libraries/dayjs';
import { AppContext } from '../context';

interface Props {
  className?: string;
  title?: string;
  assignments: Array<
    reportingWindows.FormAssignment & {
      cluster?: {
        name: string;
      };
    }
  >;
  assignmentLink: (assignment: reportingWindows.FormAssignment) => string;
}

const Label = styled.span<{ submitted: boolean }>`
  margin: 0 2rem;
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
  background-color: ${(p) =>
    p.submitted
      ? p.theme.colors.pallete.green.light
      : p.theme.colors.pallete.blue.light};
  color: rgba(0, 0, 0, 0.9);
  font-size: 1.2rem;
  font-weight: bold;
`;

const StyledToolTip = withStyles({
  tooltip: {
    padding: 8,
  },
})(Tooltip);

const LastChanged = styled.span`
  font-style: italic;
  color: ${(p) => p.theme.colors.textLight};
`;

const FormAssignmentsList = (props: Props) => {
  const { title, className, assignments, assignmentLink } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <C.List title={title} className={className}>
          {assignments
            .sort((a1, a2) => {
              const formCmp = a1.form.name
                .toLowerCase()
                .localeCompare(a2.form.name.toLowerCase());

              if (formCmp !== 0) {
                return formCmp;
              } else {
                const c1 = (a1.cluster?.name || '').toLowerCase();
                const c2 = (a2.cluster?.name || '').toLowerCase();
                return c1.localeCompare(c2);
              }
            })
            .map((a) => {
              const submitted = [
                'clean:entered',
                'raw:finalized',
                'clean:finalized',
              ].includes(a.state);

              return (
                <C.ListItem
                  key={a.assignmentId}
                  link={assignmentLink(a)}
                  text={a.form.name}
                  secondary={a.cluster && <span>{a.cluster.name}</span>}
                  itemEnd={
                    <>
                      <StyledToolTip
                        arrow
                        title={`${dayjs(a.lastUpdatedAt).locale(lang)}`}
                      >
                        <LastChanged>{`Last updated by ${a.lastUpdatedBy}`}</LastChanged>
                      </StyledToolTip>

                      <Label submitted={submitted}>
                        {t.get(
                          lang,
                          (s) =>
                            s.routes.operations.forms.labels[
                              submitted ? 'submitted' : 'notSubmitted'
                            ]
                        )}
                      </Label>
                    </>
                  }
                />
              );
            })}
        </C.List>
      )}
    </AppContext.Consumer>
  );
};

export default FormAssignmentsList;
