import React, { useContext } from 'react';

import { t } from '../../i18n';
import { BreadcrumbLinks, C, dataLoader } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

import { AppContext, getEnv } from '../context';
import { EnketoEditableForm } from './enketo';

interface Props {
  className?: string;
  window: reportingWindows.ReportingWindow;
  assignmentId: number;
  breadcrumbs: (
    assignment: reportingWindows.GetAssignmentResult
  ) => BreadcrumbLinks;
}

const FormAssignmentData = (props: Props) => {
  const { window, assignmentId, breadcrumbs } = props;
  const { lang } = useContext(AppContext);
  const loader = dataLoader(
    [
      {
        assignmentId,
        reportingWindowId: window.id,
      },
    ],
    getEnv().model.reportingWindows.getAssignment
  );
  return (
    <C.Loader
      loader={loader}
      strings={{
        ...t.get(lang, (s) => s.components.loader),
        notFound: t.get(lang, (s) => s.components.notFound),
      }}
    >
      {(assignment) => (
        <EnketoEditableForm
          reportingWindow={window}
          assignment={assignment}
          breadcrumbs={breadcrumbs(assignment)}
        />
      )}
    </C.Loader>
  );
};

export default FormAssignmentData;
