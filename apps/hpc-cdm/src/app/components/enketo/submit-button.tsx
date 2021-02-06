import React, { useState, useContext } from 'react';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import { styled } from '@unocha/hpc-ui';
import { AppContext } from '../../context';
import { t } from '../../../i18n';

const SubmitPanel = styled.div`
  border: 1px solid ${(p) => p.theme.colors.text};
  margin: 0 2.85em 2.85em 2.85em;
  padding: 1em 1em 0 1em;
`;

const WarningText = styled.span`
  font-weight: bold;
  color: ${(p) => p.theme.colors.textError};
`;

interface Props {
  validating: boolean;
  saveForm: (redirect: boolean, finalized: boolean) => void;
}

const SubmitButton = (props: Props) => {
  const { validating, saveForm } = props;
  const { lang } = useContext(AppContext);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <SubmitPanel>
      <p>
        {t.c(lang, (s) => s.routes.operations.forms.nav.submit.message, {
          warning: (key) => (
            <WarningText key={key}>
              {t.t(lang, (s) => s.routes.operations.forms.nav.submit.warning)}
            </WarningText>
          ),
        })}
      </p>
      <FormControlLabel
        control={
          <Checkbox
            color="primary"
            onChange={(e) => setConfirmed(e.target.checked)}
          />
        }
        label={t.t(lang, (s) => s.routes.operations.forms.nav.submit.confirm)}
      />
      <div>
        <button
          disabled={!confirmed || validating}
          id="submit-form"
          onClick={() => saveForm(true, true)}
          className="btn btn-primary"
        >
          {!validating && <i className="icon icon-check" />}
          {t.t(
            lang,
            (s) =>
              s.routes.operations.forms.nav.submit[
                validating ? 'validating' : 'submit'
              ]
          )}
        </button>
      </div>
    </SubmitPanel>
  );
};

export default SubmitButton;
