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
            .sort((a1, a2) => (a1.form.name > a2.form.name ? 1 : -1))
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
