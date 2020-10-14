import React, { useContext } from 'react';

import { t } from '../../i18n';
import { C, dataLoader } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';

import { AppContext, getEnv } from '../context';
import { EnketoEditableForm } from './enketo';
import { browserSupportedByEnketo } from './enketo/util';

interface Props {
  className?: string;
  window: reportingWindows.ReportingWindow;
  assignmentId: number;
  header?: (assignment: reportingWindows.GetAssignmentResult) => JSX.Element;
}

const FormAssignmentData = (props: Props) => {
  const { window, assignmentId, header } = props;
  const { lang } = useContext(AppContext);
  const loader = dataLoader(
    [
      {
        assignmentId,
      },
    ],
    getEnv().model.reportingWindows.getAssignment
  );
  return !browserSupportedByEnketo() ? (
    <C.ErrorMessage
      strings={t.get(lang, (s) => s.components.unsupportedBrowser)}
    />
  ) : (
    <C.Loader
      loader={loader}
      strings={{
        ...t.get(lang, (s) => s.components.loader),
        notFound: t.get(lang, (s) => s.components.notFound),
      }}
    >
      {(assignment) => (
        <>
          {header && header(assignment)}
          <EnketoEditableForm
            reportingWindow={window}
            assignment={assignment}
          />
        </>
      )}
    </C.Loader>
  );
};

export default FormAssignmentData;
