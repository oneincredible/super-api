const bcrypt = require('bcrypt');

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return reject(err);
      }
      resolve(hash);
    });
  });
}

function createTransform(encode, decode) {
  return { encode, decode };
}

function noop(value) {
  return value;
}

function date() {
  return createTransform(
    date => date.toISOString(),
    string => new Date(string)
  );
}

function float() {
  return createTransform(parseFloat, parseFloat);
}

function int(base = 10) {
  const parse = value => parseInt(value, base);
  return createTransform(parse, parse);
}

function password() {
  return createTransform(hashPassword, noop);
}

module.exports = {
  date,
  float,
  int,
  password,
  noop: createTransform(noop, noop),
};
