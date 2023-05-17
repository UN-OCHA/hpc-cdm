import React, { useContext } from 'react';

import { t } from '../../i18n';
import { C, dataLoader } from '@unocha/hpc-ui';
import { reportingWindows } from '@unocha/hpc-data';
import { useParams } from 'react-router-dom';

import { AppContext, getEnv } from '../context';
import { EnketoEditableForm } from './enketo';
import { browserSupportedByEnketo } from './enketo/util';

interface Props {
  className?: string;
  window: reportingWindows.ReportingWindow;
  header?: (assignment: reportingWindows.GetAssignmentResult) => JSX.Element;
}

type FormAssignmentRouteParams = {
  assignmentId: string;
};

const FormAssignmentData = (props: Props) => {
  const { window, header } = props;
  const { lang } = useContext(AppContext);

  const { assignmentId: assignmentIdString } =
    useParams<FormAssignmentRouteParams>();
  const assignmentId = parseInt(assignmentIdString ?? '', 10);

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
