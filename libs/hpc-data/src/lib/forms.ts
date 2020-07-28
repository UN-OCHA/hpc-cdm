export interface FormMeta {
  id: number;
  name: string;
}

export interface Form extends FormMeta {
  /**
   * TODO: flesh this out with enketo definition types
   */
  definition: string;
}

export interface GetFormResult extends FormMeta {
  form: any;
  model: any;
}

export interface Model {
  getForm(id: number): Promise<GetFormResult>;
}
