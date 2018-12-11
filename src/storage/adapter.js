const { createRevisionedStorageAdapter } = require('./adapter/revisioned');

module.exports = {
  createStorage: createRevisionedStorageAdapter,
};
