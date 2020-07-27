import React from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';

interface Props {
  className?: string;
  assignments: reportingWindows.FormAssignment[];
  assignmentLink: (assignment: reportingWindows.FormAssignment) => string;
}

const FormAssignmentsList = (props: Props) => {
  const { assignments, assignmentLink } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <ul>
          {assignments.map((a, i) => (
            <li key={i}>
              <Link to={assignmentLink(a)}>{a.form.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </AppContext.Consumer>
  );
};

export default styled(FormAssignmentsList)``;
