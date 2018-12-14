const express = require('express');
const { isUUID } = require('../validation/uuid');

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

function createRelationRouter(name, relationStorage) {
  const router = express.Router();

  router.put(
    `/:parentId/${name}/:childId`,
    ensureUUID('parentId'),
    ensureUUID('childId'),
    async (req, res) => {
      const { parentId, childId } = req.params;
      await relationStorage.add(parentId, childId);
      res.statusCode = 201;
      res.end();
    }
  );

  router.delete(
    `/:parentId/${name}/:childId`,
    ensureUUID('parentId'),
    ensureUUID('childId'),
    async (req, res) => {
      const { parentId, childId } = req.params;
      await relationStorage.remove(parentId, childId);
      res.end();
    }
  );

  return router;
}

function createStorageRouter(Model, storage) {
  const router = express.Router();
  router.use(express.json());

  router.post('/', async (req, res) => {
    const model = Model.decode(req.body);
    await storage.store(model);
    res.statusCode = 201;
    res.set('location', `${req.baseUrl}/${model.id}`);
    res.end();
  });

  router.get('/:modelId', ensureUUID('modelId'), async (req, res) => {
    const id = req.params.modelId;
    const result = await storage.fetch(id);
    if (!result) {
      res.statusCode = 404;
      return res.send({
        error: {
          message: `No object found for ${id}`,
        },
      });
    }
    res.send(Model.encode(result));
  });

  Object.entries(storage.relations).forEach(([name, storage]) => {
    const relationRouter = createRelationRouter(name, storage);
    router.use(relationRouter);
  });

  return router;
}

module.exports = {
  createStorageRouter,
};
