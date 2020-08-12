declare module 'enketo-core' {
  export class Form {
    constructor(
      form: HTMLFormElement,
      options: {
        modelStr: string;
        instanceStr?: string;
        external: undefined;
      }
    );

    init(): string[];

    getDataStr(opts: { irrelevant: boolean }): string;
  }
}

declare module 'enketo-core/src/js/file-manager' {
  export function getCurrentFiles(): Blob[];
  export function getFileUrl(subject: File | string): Promise<string>;
}
