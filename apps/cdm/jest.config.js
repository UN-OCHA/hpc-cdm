module.exports = {
  name: 'cdm',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/cdm',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
