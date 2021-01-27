import { Form } from 'enketo-core';
import fileManager from 'enketo-core/src/js/file-manager';
import $ from 'jquery';
import marked from 'marked';

import { LANGUAGE_CHOICE, LanguageKey } from '../../../i18n';

const markedHtml = (
  form: string,
  titlePrefix?: string
): JQuery<HTMLElement> => {
  const html = $(form);

  for (const selector of ['.question-label', '.question > .or-hint']) {
    $(selector, html).each(function () {
      const text = $(this).text().replace(/\n/g, '<br />');
      $(this).html(marked(text));
    });
  }

  if (titlePrefix) {
    const title = $('h3#form-title', html);
    title.text(`${titlePrefix}: ${title.text()}`);
  }

  // operation selection must be visible in order for
  // locations/sublocations to have available options
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

  constructor(
    html: string,
    modelStr: string,
    content: string | null,
    files: FormFile[],
    opts?: {
      titlePrefix?: string;
      onDataUpdate?: (event: { xform: XForm }) => void;
    }
  ) {
    this.loading = true;
    const { titlePrefix, onDataUpdate } = opts || {};
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

    $('.container').replaceWith(markedHtml(html, titlePrefix));
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

    this.form = new Form(
      formElement,
      {
        modelStr,
        instanceStr: content ? content : undefined,
        external: undefined,
      },
      {
        // If the language chosen in the app is available in form, it will be used else the default language of the form
        language: LANGUAGE_CHOICE.getLanguage(),
      }
    );
  }

  private changeLanguage(languages: string[], selectedLanguage: string) {
    // set the value for the dropdown
    $('#form-languages').val(selectedLanguage);
    // activate the correct language in the form
    languages.forEach((lang) => {
      $(`span[lang="${lang}"]`).removeClass('active');
    });
    $(`span[lang="${selectedLanguage}"]`).addClass('active');
  }

  private setupLanguageUI(formLanguages: string[], selectedLanguage?: string) {
    this.changeLanguage(
      formLanguages,
      selectedLanguage || $('#form-languages').data('default-lang')
    );
    $('#form-languages').on('change', () => {
      const _selectedLang = selectedLanguage
        ? selectedLanguage
        : ($(this).val() as string);
      this.changeLanguage(formLanguages, _selectedLang);
    });
    $('#form-languages').show();
  }

  private showOrHideLanguageUI(
    newLanguagesExistForForm: boolean,
    selectedLanguageIsSupported: boolean,
    formLanguages: string[],
    selectedLanguage: string
  ) {
    // need to show drop down only if form is available in languages not available in the app or if selected language isn't supported
    if (
      (newLanguagesExistForForm || !selectedLanguageIsSupported) &&
      formLanguages.length > 1
    ) {
      this.setupLanguageUI(
        formLanguages,
        selectedLanguageIsSupported ? selectedLanguage : undefined
      );
    } else {
      $('#form-languages').hide();
      this.changeLanguage(formLanguages, selectedLanguage);
    }
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

      // Disable operation selection option when operation is provided
      $('select[name="/data/Group_IN/Group_INContact/IN_Operation"]').each(
        function () {
          $(this).prop('disabled', $(this).val() !== '');
        }
      );

      const appLanguages = LANGUAGE_CHOICE.getLanguages().reduce(
        (languageObj: Record<LanguageKey, boolean>, language) => {
          languageObj[language.key] = true;
          return languageObj;
        },
        {} as Record<LanguageKey, boolean>
      );

      const formLanguages: string[] = this.form.languages;
      const newLanguagesExistForForm = formLanguages.some(
        (language) => !appLanguages[language as LanguageKey]
      );
      const selectedLanguage = LANGUAGE_CHOICE.getLanguage();
      const selectedLanguageIsSupported = formLanguages.some(
        (language) => language === selectedLanguage
      );

      this.showOrHideLanguageUI(
        newLanguagesExistForForm,
        selectedLanguageIsSupported,
        formLanguages,
        selectedLanguage
      );

      LANGUAGE_CHOICE.addListener((lang) => {
        const _selectedLanguageIsSupported = formLanguages.some(
          (language) => language === lang
        );
        this.showOrHideLanguageUI(
          newLanguagesExistForForm,
          _selectedLanguageIsSupported,
          formLanguages,
          lang
        );
      });

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
    return $(this.form.pages.activePages[totalPages]).hasClass('current');
  }

  isCurrentPageTheFirstPage(): boolean {
    return $(this.form.pages.activePages[0]).hasClass('current');
  }

  resetView(): HTMLFormElement {
    return this.form.resetView();
  }
}
