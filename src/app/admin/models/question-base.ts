export class QuestionBase<T> {
  value: T;
  key: string;
  label: string;
  required: boolean;
  example: string;
  order: number;
  controlType: string;
  isJSON: boolean;
  disabled: boolean;
  notVisible: boolean;
  maxlength: number;

  constructor(options: {
      value?: T,
      key?: string,
      label?: string,
      required?: boolean,
      order?: number,
      controlType?: string,
      example?: string,
      disabled?: boolean,
      notVisible?: boolean,
      maxlength?: number
    } = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.example = options.example || '';
    this.controlType = options.controlType || '';
    this.disabled = options.disabled;
    this.notVisible = options.notVisible;
    this.maxlength = options.maxlength;
  }
}
