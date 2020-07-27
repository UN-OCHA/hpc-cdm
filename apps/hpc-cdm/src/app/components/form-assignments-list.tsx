import React from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

import { AppContext } from '../context';

const CLS = {
  PREFIX: 'prefix',
  FORM_NAME: 'form-name',
};

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
              <Link to={assignmentLink(a)}>
                {a.prefix ? (
                  <span className={CLS.PREFIX}>
                    <span>{a.prefix}</span>
                    <span>&gt;</span>
                  </span>
                ) : null}
                <span className={CLS.FORM_NAME}>{a.form.name}</span>
              </Link>
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
      display: flex;
      padding: ${(p) => p.theme.marginPx.md}px ${(p) => p.theme.marginPx.sm}px;
      border: 1px solid ${(p) => p.theme.colors.panel.border};
      border-radius: ${(p) => p.theme.sizing.borderRadiusSm};
      background: ${(p) => p.theme.colors.panel.bg};
      font-size: 1.2rem;

      > .${CLS.PREFIX} {
        opacity: 0.4;
        font-weight: bold;
      }

      span {
        margin: 0 ${(p) => p.theme.marginPx.sm}px;
      }

      &:hover {
        background: ${(p) => p.theme.colors.panel.bgHover};
        text-decoration: none;

        > .${CLS.FORM_NAME} {
          text-decoration: underline;
        }
      }
    }
  }
`;
