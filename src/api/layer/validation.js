const { isUUID } = require('../../validation/uuid');

function createUUIDCheckLayer(getValues) {
  return function checkUUID(req, res, next) {
    const values = getValues(req);
    for (const value of values) {
      if (!isUUID(value)) {
        res.statusCode = 400;
        res.send({
          error: {
            message: `Malformed UUID: ${value}`,
          },
        });
        return;
      }
    }

    return next();
  };
}

module.exports = {
  createUUIDCheckLayer,
};
