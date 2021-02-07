import { dialogs } from '@unocha/hpc-ui';

import { LANGUAGE_CHOICE, t } from '../../../../i18n';

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
    let title: string | undefined = undefined;
    let message: string | undefined;

    if (typeof content === 'string') {
      message = content;
    } else {
      // TODO: remove hard-coding of heading message, and instead use key
      // when translation module is intercepted
      if (content.heading === 'Delete this group of responses?') {
        mode = 'repeatremove';
        title = t.t(
          lang,
          (s) =>
            s.routes.operations.forms.enketoStrings.confirm.repeatremove.heading
        );
        message = t.t(
          lang,
          (s) =>
            s.routes.operations.forms.enketoStrings.confirm.repeatremove.msg
        );
      } else {
        title = content.heading;
        message = content.message || content.msg;
      }
    }

    return dialogs
      .confirm({
        buttonCancel: t.t(lang, (s) => s.components.dialogs.cancel),
        buttonConfirm: t.t(lang, (s) => s.components.dialogs.okay),
        title,
        message,
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
