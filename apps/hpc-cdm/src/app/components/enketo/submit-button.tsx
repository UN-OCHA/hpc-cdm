import React, { useState, useContext } from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';
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
  isValidating: boolean;
  saveForm: (redirect: boolean, finalized: boolean) => void;
}

const SubmitButton = (props: Props) => {
  const { isValidating, saveForm } = props;
  const { lang } = useContext(AppContext);
  const [isConfirmed, setIsConfirmed] = useState(false);

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
            onChange={(e) => setIsConfirmed(e.target.checked)}
          />
        }
        label={t.t(lang, (s) => s.routes.operations.forms.nav.submit.confirm)}
      />
      <div>
        <button
          disabled={!isConfirmed || isValidating}
          id="submit-form"
          onClick={() => saveForm(true, true)}
          className="btn btn-primary"
        >
          {!isValidating && <i className="icon icon-check" />}
          {t.t(
            lang,
            (s) =>
              s.routes.operations.forms.nav.submit[
                isValidating ? 'validating' : 'submit'
              ]
          )}
        </button>
      </div>
    </SubmitPanel>
  );
};

export default SubmitButton;
