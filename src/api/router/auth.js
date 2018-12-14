const express = require('express');
const uuidv4 = require('uuid/v4');
const { compare } = require('../../security/password');
const { createAuthorizationLayer } = require('../layer/auth');

function createLogin(sessionStorage, userStorage) {
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
        message: 'Authentication failed.',
      },
    });
  };
}

function createFetch() {
  return function fetchSession(req, res) {
    res.send(req.session);
  };
}

function createAuthenticationRouter(sessionStorage, userStorage) {
  const router = express.Router();
  router.use(express.json());

  const requireAuth = createAuthorizationLayer(sessionStorage);

  router.get('/', requireAuth, createFetch());

  router.post('/', createLogin(sessionStorage, userStorage));

  return router;
}

module.exports = {
  createAuthenticationRouter,
};
