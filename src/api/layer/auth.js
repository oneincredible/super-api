function createAuthorizationLayer(sessionStorage) {
  return async function ensureAuthorization(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
      res.statusCode = 401;
      res.send({
        error: {
          message: 'Authorization required.',
        },
      });
      return;
    }

    const [type, token] = auth.split(' ');
    if (type.toLowerCase() !== 'bearer') {
      res.statusCode = 400;
      res.send({
        error: {
          message: `Unknown authorization type: ${type}.`,
        },
      });
      return;
    }

    const session = await sessionStorage.fetch(token);
    if (!session) {
      res.statusCode = 401;
      res.send({
        error: {
          message: 'Invalid token.',
        },
      });
      return;
    }

    req.session = session;
    next();
  };
}

module.exports = {
  createAuthorizationLayer,
};
