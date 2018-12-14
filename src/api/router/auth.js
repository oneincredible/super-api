const express = require('express');
const uuidv4 = require('uuid/v4');
const { compare, hash } = require('../../security/password');
const { createAuthorizationLayer } = require('../layer/auth');

function createHandleLogin(sessionStorage, userStorage) {
  return async function handleLogin(req, res) {
    const { id, secret } = req.body;

    const user = await userStorage.fetch(id);
    if (await compare(secret, user.password.hash)) {
      const token = uuidv4();
      const session = {
        id: token,
        user,
      };
      await sessionStorage.store(session);

      res.statusCode = 201;
      res.set('location', `${req.baseUrl}/session`);
      return res.send({ token });
    }

    res.statusCode = 401;
    return res.send({
      error: {
        message: 'Authentication failed',
      },
    });
  };
}

function createAuthenticationRouter(sessionStorage, userStorage) {
  const router = express.Router();

  router.get('/', createAuthorizationLayer(sessionStorage), (req, res) =>
    res.send(req.session)
  );

  router.post('/', createHandleLogin(sessionStorage, userStorage));

  return router;
}

module.exports = {
  createAuthenticationRouter,
};
