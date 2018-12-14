const { isUUID } = require('../../validation/uuid');

function ensureUUID(paramName) {
  return function(req, res, next) {
    const value = req.params[paramName];
    if (isUUID(value)) {
      return next();
    }

    res.statusCode = 400;
    res.send({
      error: {
        message: `Malformed UUID: ${value}`,
      },
    });
  };
}

module.exports = {
  ensureUUID,
};
