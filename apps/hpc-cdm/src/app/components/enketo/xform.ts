import { Form } from 'enketo-core';
import fileManager from 'enketo-core/src/js/file-manager';
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
      formElement.addEventListener('dataupdate', () => {
        if (!this.loading) {
          onDataUpdate({
            xform: this,
          });
        }
      });
    }
    this.form = new Form(formElement, {
      modelStr,
      instanceStr: content || undefined,
      external: undefined,
    });
  }

  async init(editable: boolean): Promise<void> {
    return new Promise((resolve) => {
      // Adding this cycle to allow enketo to initialize things
      setTimeout(() => {
        const errors = this.form.init();

        if (errors && errors.length) {
          console.error('Form Errors', JSON.stringify(errors));
        }

        if (!editable) {
          $('#form :input:not(:button)').each(function () {
            $(this).prop('disabled', true);
          });
        }
        this.loading = false;
        resolve();
      });
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
}
