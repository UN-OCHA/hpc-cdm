declare module 'enketo-core' {
  export class Form {
    constructor(
      form: HTMLFormElement,
      options: {
        modelStr: string;
        instanceStr?: string;
        external: undefined;
        submitted?: boolean;
      },
      formOptions?: {
        language: string;
      }
    );

    init(): string[];

    getDataStr(opts: { irrelevant: boolean }): string;

    pages: {
      active: boolean;
      activePages: Element[];
      current: Element;
    };

    get languages(): string[];

    resetView(): HTMLFormElement;
  }
}

declare module 'enketo-core/src/js/file-manager' {
  export function getFileUrl(subject?: File | string): Promise<string>;
  export function getCurrentFiles(): File[];
}

declare module 'enketo-core/src/js/calculate' {
  export function update(): void;
}

declare module 'enketo-core/src/js/form-model' {
  export class FormModel {
    setInstanceIdAndDeprecatedId(): void;
  }
}

declare module 'enketo-core/src/js/preload' {
  export function init(): void;
}
