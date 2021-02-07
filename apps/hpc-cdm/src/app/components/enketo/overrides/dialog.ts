import { dialogs } from '@unocha/hpc-ui';

import { LANGUAGE_CHOICE, t } from '../../../../i18n';

import { enketoTranslate } from './translator';

type DialogContentObject = {
  msg?: string;
  message?: string;
  heading: string;
};

// TODO: implement prompts at some point
const alert = (content: string | DialogContentObject) => Promise.reject('TODO');

const confirm = (content: string | DialogContentObject) =>
  LANGUAGE_CHOICE.withLanguage((lang) => {
    /**
     * Do we need to handle this confirmation in any special way?
     */
    let mode: null | 'repeatremove' = null;

    const repeatRemoveHeader = enketoTranslate('confirm.repeatremove.heading');

    if (typeof content !== 'string' && content.heading === repeatRemoveHeader) {
      mode = 'repeatremove';
    }

    return dialogs
      .confirm({
        buttonCancel: t.t(lang, (s) => s.components.dialogs.cancel),
        buttonConfirm: t.t(lang, (s) => s.components.dialogs.okay),
        title: typeof content === 'string' ? undefined : content.heading,
        message:
          typeof content === 'string'
            ? content
            : content.message || content.msg,
      })
      .then((res) => {
        if (res && mode === 'repeatremove') {
          // Display a message to indicate that the browser may freeze when
          // enketo updates it
          const { dismiss } = dialogs.controlledAlert({
            title: t.t(
              lang,
              (s) => s.routes.operations.forms.removingItem.title
            ),
            message: t.t(
              lang,
              (s) => s.routes.operations.forms.removingItem.message
            ),
          });
          // Wait until after the animation has completed,
          // and the browser freeze will have begun
          setTimeout(dismiss, 1000);
        }
        return res;
      });
  });

// TODO: implement prompts at some point
const prompt = () => Promise.reject('TODO');

export default {
  alert,
  confirm,
  prompt,
};
