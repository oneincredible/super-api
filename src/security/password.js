const bcrypt = require('bcrypt');

function compare(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

function hash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return reject(err);
      }
      resolve(hash);
    });
  });
}

module.exports = {
  compare,
  hash,
};
