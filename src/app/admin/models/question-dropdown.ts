import { QuestionBase } from './question-base';

export class DropdownQuestion extends QuestionBase<string> {
  controlType = 'select';
  options: {key: string, value: string}[] = [];
  multiple: boolean;

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
    this.multiple = options['multiple'] || false;
  }
}
