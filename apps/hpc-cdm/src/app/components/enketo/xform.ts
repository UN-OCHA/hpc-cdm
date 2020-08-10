import { Form } from 'enketo-core';
import $ from 'jquery';
import marked from 'marked';
//TODO replace with lodash or something else
import _ from 'underscore';

const withElements = (nodes: object) => {
  return _.chain(nodes).filter((n) => n.nodeType === Node.ELEMENT_NODE);
};

interface Result {
  [key: string]: any[] | Result | string[] | string | null;
}

const nodesToJs = (data: object, repeatPaths: string[], path: string) => {
  repeatPaths = repeatPaths || [];
  path = path || '';
  const result: Result = {};
  withElements(data).each((n: Element) => {
    const dbDocAttribute = n.attributes.getNamedItem('db-doc');
    if (dbDocAttribute && dbDocAttribute.value === 'true') {
      return;
    }

    const typeAttribute = n.attributes.getNamedItem('type');
    const updatedPath = `${path}/${n.nodeName}`;

    const hasChildren = withElements(n.childNodes).size().value();
    let value;
    if (hasChildren) {
      value = nodesToJs(n.childNodes, repeatPaths, updatedPath);
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
      // result[n.nodeName].push(value);
    } else {
      result[n.nodeName] = value;
    }
  });
  return result;
};

const findCurrentElement = (elem: JQuery, name: string, childMatcher: any) => {
  return childMatcher ? elem.find(childMatcher(name)) : elem.children(name);
};

const bindJsonToXml = (elem: JQuery, data: any, childMatcher: any) => {
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

const bindDataToModel = (model: string, data: any) => {
  const xml = $($.parseXML(model));
  const root = xml.find('model instance').children().first();
  if (data) {
    bindJsonToXml(root, data, (name: string) =>
      '>%, >inputs>%'.replace(/%/g, name)
    );
  }
  return new XMLSerializer().serializeToString(root[0]);
};

const markedHtml = (form: string): => {
  const html = $(form);
  for (const selector of ['.question-label', '.question > .or-hint']) {
    $(selector, html).each(function () {
      const text = $(this).text().replace(/\n/g, '<br />');
      $(this).html(marked(text));
    });
  }
  return html;
};

class XForm {
  private form: Form;

  constructor(html = {}, modelStr: any, content: any) {
    // TODO initialize file manager
    // enketoFiles.init();
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
      return nodesToJs(childNodes, repeatPaths, `/${nodeName}`);
    }
    return null;
  }
}

export default XForm;
