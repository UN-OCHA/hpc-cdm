import { QuestionBase } from './question-base';

export class TextareaQuestion extends QuestionBase<string> {
  controlType = 'textarea';
  isJSON: boolean;

  constructor(options: {} = {}) {
    super(options);

    this.isJSON = options['isJSON'] || false;

    if (this.isJSON) {
      this.value = JSON.stringify(options['value'], null, 2) || '';
    }
  }
}
