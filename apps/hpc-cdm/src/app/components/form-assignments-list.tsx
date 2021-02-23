import React from 'react';

import { C, styled } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';
import { t } from '../../i18n';

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
                  label={
                    <Label submitted={submitted}>
                      {t.get(
                        lang,
                        (s) =>
                          s.routes.operations.forms.labels[
                            submitted ? 'submitted' : 'notSubmitted'
                          ]
                      )}
                    </Label>
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
