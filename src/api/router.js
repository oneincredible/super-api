const { createAuthorizationLayer } = require('./layer/auth');
const { createStorageRouter } = require('./router/storage');

module.exports = {
  createAuthorizationLayer,
  createStorageRouter,
};
