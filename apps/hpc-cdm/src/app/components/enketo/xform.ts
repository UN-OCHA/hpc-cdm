import { Form } from 'enketo-core';
import fileManager from 'enketo-core/src/js/file-manager';
import $ from 'jquery';
import marked from 'marked';
import { forms } from '@unocha/hpc-data';

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

export default class XForm {
  private form: Form;
  private files: forms.FormFile[];

  constructor(
    html: string,
    modelStr: string,
    content: string | null,
    files: forms.FormFile[],
    editable = true
  ) {
    this.files = files;
    fileManager.getFileUrl = async (subject: File | string) => {
      if (typeof subject === 'string') {
        const file = files.filter((f) => f.name === subject);
        if (file) {
          return file[0].url;
        }
      }
      return window.URL.createObjectURL(subject);
    };

    $('.container').replaceWith(markedHtml(html));
    const formElement = $('#form').find('form').first()[0];
    this.form = new Form(formElement, {
      modelStr,
      instanceStr: content || undefined,
      external: undefined,
    });
    const errors = this.form.init();
    if (errors && errors.length) {
      console.error('Form Errors', JSON.stringify(errors));
    }

    if (!editable) {
      $('#form :input:not(:button)').each(function (x) {
        $(this).prop('disabled', true);
      });
    }
  }

  getData() {
    return this.form.getDataStr({ irrelevant: false });
  }

  getBlobs(): Blob[] {
    return fileManager.getCurrentFiles();
  }

  getFiles(): forms.FormFile[] {
    return this.files;
  }
}
