import { Form } from 'enketo-core';
import fileManager from 'enketo-core/src/js/file-manager';
import $ from 'jquery';
import marked from 'marked';
import lodash from 'lodash';
import { forms } from '@unocha/hpc-data';

const withElements = (nodes: NodeListOf<ChildNode>) => {
  return lodash(nodes).filter(
    (n: ChildNode) => n.nodeType === Node.ELEMENT_NODE
  );
};

interface Result {
  [key: string]: (string | any)[] | string;
}

const enketoXMLDataToJson = (
  data: NodeListOf<ChildNode>,
  repeatPaths: string[],
  path: string
) => {
  repeatPaths = repeatPaths || [];
  path = path || '';
  const result: Result = {};
  withElements(data).each((n: any) => {
    const dbDocAttribute = n.attributes.getNamedItem('db-doc');
    if (dbDocAttribute && dbDocAttribute.value === 'true') {
      return;
    }

    const typeAttribute = n.attributes.getNamedItem('type');
    const updatedPath = `${path}/${n.nodeName}`;

    const hasChildren = withElements(n.childNodes).size();
    let value;
    if (hasChildren) {
      value = enketoXMLDataToJson(n.childNodes, repeatPaths, updatedPath);
    } else if (typeAttribute && typeAttribute.value === 'binary') {
      // this is attached to the doc instead of inlined
      value = '';
    } else {
      value = n.textContent;
    }

    if (value && repeatPaths.indexOf(updatedPath) !== -1) {
      if (!result[n.nodeName]) {
        result[n.nodeName] = [];
      }
      // if (Array.isArray(n.nodeName)) {
      //   result[n.nodeName].push(value);
      // }
    } else {
      result[n.nodeName] = value;
    }
  });
  return result;
};

const findCurrentElement = (
  elem: JQuery,
  name: string,
  childMatcher: ((name: string) => string) | null
) => {
  return childMatcher ? elem.find(childMatcher(name)) : elem.children(name);
};

const bindJsonToXml = (
  elem: JQuery,
  data: any,
  childMatcher: ((name: string) => string) | null
) => {
  Object.keys(data)
    .map((key) => [key, data[key]])
    .forEach(([id, value]) => {
      const current = findCurrentElement(elem, id, childMatcher);
      if (typeof value === 'object') {
        if (current.children().length) {
          bindJsonToXml(current, value, null);
        } else {
          current.text(value._id);
        }
      } else {
        current.text(value);
      }
    });
};

const bindDataToModel = (model: string, data: object) => {
  const xml = $($.parseXML(model));
  const root = xml.find('model instance').children().first();
  if (data) {
    bindJsonToXml(root, data, (name: string) =>
      '>%, >inputs>%'.replace(/%/g, name)
    );
  }
  return new XMLSerializer().serializeToString(root[0]);
};

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
    modelStr: any,
    content: any,
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
      instanceStr: bindDataToModel(modelStr, content),
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
    const data = this.form.getDataStr({ irrelevant: false });
    const root = $.parseXML(data).firstChild;
    const repeatPaths = $(this.form)
      .find('repeat[nodeset]')
      .map(() => {
        return $(this).attr('nodeset');
      })
      .get();
    if (root) {
      const { childNodes, nodeName } = root;
      return enketoXMLDataToJson(childNodes, repeatPaths, `/${nodeName}`);
    }
    return null;
  }

  getBlobs(): Blob[] {
    return fileManager.getCurrentFiles();
  }

  getFiles(): forms.FormFile[] {
    return this.files;
  }
}
