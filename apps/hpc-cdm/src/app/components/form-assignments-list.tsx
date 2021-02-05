import React from 'react';
import { Link } from 'react-router-dom';

import { C, styled } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

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
            .map((a, i) => (
              <C.ListItem
                key={i}
                link={assignmentLink(a)}
                text={a.form.name}
                secondary={a.cluster && <span>{a.cluster.name}</span>}
              />
            ))}
        </C.List>
      )}
    </AppContext.Consumer>
  );
};

export default FormAssignmentsList;
