import React from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';

interface Props {
  className?: string;
  assignments: Array<
    reportingWindows.FormAssignment & {
      prefix?: string;
    }
  >;
  assignmentLink: (assignment: reportingWindows.FormAssignment) => string;
}

const FormAssignmentsList = (props: Props) => {
  const { className, assignments, assignmentLink } = props;

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <ul className={className}>
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

export default styled(FormAssignmentsList)`
  list-style: none;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;

  li {
    display: block;
    margin: ${(p) => p.theme.marginPx.sm}px 0;

    a {
      display: block;
      padding: ${(p) => p.theme.marginPx.md}px;
      border: 1px solid ${(p) => p.theme.colors.panel.border};
      border-radius: ${(p) => p.theme.sizing.borderRadiusSm};
      background: ${(p) => p.theme.colors.panel.bg};
      font-size: 1.2rem;

      &:hover {
        background: ${(p) => p.theme.colors.panel.bgHover};
      }
    }
  }
`;
