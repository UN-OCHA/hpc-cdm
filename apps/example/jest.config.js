module.exports = {
  name: "example",
  preset: "../../jest.config.js",
  coverageDirectory: "../../coverage/apps/example",
  snapshotSerializers: [
    "jest-preset-angular/AngularSnapshotSerializer.js",
    "jest-preset-angular/HTMLCommentSerializer.js"
  ]
};
