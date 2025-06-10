import prettierConfigBase from '@unocha/hpc-repo-tools/prettier.config.base.js';

export default {
  ...prettierConfigBase,
  bracketSameLine: false,
  overrides: [
    ...prettierConfigBase.overrides,
    {
      files: ['.husky/*'],
      options: {
        parser: 'sh',
      },
    },
  ],
};
