import { Form } from 'enketo-core';
import fileManager from 'enketo-core/src/js/file-manager';
// import calcModule from 'enketo-core/src/js/calculate';
// import { FormModel } from 'enketo-core/src/js/form-model';
// import preloadModule from 'enketo-core/src/js/preload';

import $ from 'jquery';
import marked from 'marked';

const markedHtml = (form: string): JQuery<HTMLElement> => {
  const html = $(form);

  for (const selector of ['.question-label', '.question > .or-hint']) {
    $(selector, html).each(function () {
      const text = $(this).text().replace(/\n/g, '<br />');
      $(this).html(marked(text));
    });
  }

  // Hardcoding to show operation selection
  $('[name="/data/Group_IN/Group_INContact/IN_Operation"]', html).each(
    function () {
      $(this).attr('data-relevant', 'true()');
    }
  );

  return html;
};

export interface FormFile {
  name: string;
  data: Blob;
}

export default class XForm {
  private form: Form;
  private files: FormFile[];
  private loading: boolean;
  private modelStr: string;
  private content: string | null;

  constructor(
    html: string,
    modelStr: string,
    content: string | null,
    files: FormFile[],
    opts?: {
      onDataUpdate?: (event: { xform: XForm }) => void;
    }
  ) {
    this.loading = true;
    const { onDataUpdate } = opts || {};
    this.files = files;
    this.modelStr = modelStr;
    this.content = content;

    // // Completely disable calculations in Enketo Core
    // calcModule.update = () => {
    //   // console.log( 'Calculations disabled.' );
    // };
    // // Completely disable instanceID and deprecatedID population in Enketo Core
    // FormModel.prototype.setInstanceIdAndDeprecatedId = () => {
    //   // console.log( 'InstanceID and deprecatedID population disabled.' );
    // };
    // // Completely disable preload items
    // preloadModule.init = () => {
    //   // console.log( 'Preloaders disabled.' );
    // };

    fileManager.getFileUrl = async (subject) => {
      if (typeof subject === 'string') {
        const file = files.filter((f) => f.name === subject);
        if (file.length > 0) {
          return window.URL.createObjectURL(file[0].data);
        } else {
          throw new Error(`Unable to find file with the name ${subject}`);
        }
      }
      return window.URL.createObjectURL(subject);
    };

    $('.container').replaceWith(markedHtml(html));
    const formElement = $('#form').find('form').first()[0];
    if (onDataUpdate) {
      formElement.addEventListener(
        'dataupdate',
        () => {
          if (!this.loading) {
            onDataUpdate({
              xform: this,
            });
          }
        },
        { capture: true }
      );
    }

    this.form = new Form(formElement, {
      modelStr,
      instanceStr: content ? content : undefined,
      external: undefined,
    });
  }

  async init(editable: boolean): Promise<void> {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const errors = this.form.init();
      const t1 = performance.now();
      console.log('Form initialization time: ' + (t1 - t0) + ' millis');
      if (errors && errors.length) {
        console.error('Form Errors', JSON.stringify(errors));
      }

      if (!editable) {
        $('#form :input:not(:button)').each(function () {
          $(this).prop('disabled', true);
        });
      }

      $('select[name="/data/Group_IN/Group_INContact/IN_Operation"]').each(
        function () {
          if ($(this).val()) {
            $(this).prop('disabled', true);
          }
        }
      );

      this.loading = false;
      resolve();
    });
  }

  /**
   * Return an object with the form data and uploaded files.
   *
   * Unfortunately, enketo doesn't seem to store anything about the files other
   * than it's filename, and it doesn't provide an API that allows us to easily
   * see which files are currently in use by the form. So in the case of
   * replaced files, we need to determine whether or not they're still used
   * based on whether the filename appears in the data.
   */
  getData(): {
    data: string;
    files: FormFile[];
  } {
    const data = this.form.getDataStr({ irrelevant: false });

    /** Collect the newly uploaded files */
    const newUploads = new Map<string, File>();
    for (const file of fileManager.getCurrentFiles()) {
      newUploads.set(file.name, file);
    }

    /**
     * Remove blobs that no longer appear in the data,
     * or that have been replaced
     */
    const files = this.files.filter(
      (f) => data.includes(f.name) && !newUploads.has(f.name)
    );

    /** Add the new files */
    for (const upload of newUploads.values()) {
      files.push({
        data: upload,
        name: upload.name,
      });
    }

    return { data, files };
  }

  isCurrentPageTheLastPage(): boolean {
    const totalPages = this.form.pages.activePages.length - 1;
    return this.form.pages.activePages[totalPages] === this.form.pages.current;
  }

  isCurrentPageTheFirstPage(): boolean {
    return this.form.pages.activePages[0] === this.form.pages.current;
  }

  // resetView(): HTMLFormElement {
  //   return this.form.resetView();
  // }
}
