const { createModel } = require('../../model/model');
const { value } = require('../../model/field');
const {
  createFetchRevision,
  createStoreRevision,
  createRevokeRevision,
  createPromoteRevision,
} = require('../query');

describe('Query modules', () => {
  const Model = createModel([value('name'), value('length'), value('rate')]);

  describe('#createFetchRevision', () => {
    it('creates a query builder based on model', () => {
      const createQuery = createFetchRevision(Model, 'video');
      const query = createQuery('my-whatever-id');
      expect(query.text).toMatchSnapshot();
      expect(query.values).toEqual(['my-whatever-id']);
    });
  });

  describe('#createStoreRevision', () => {
    it('creates a query builder based on model', () => {
      const model = Model.decode({
        id: '352b2178-ee3c-11e8-9af5-00090ffe0001',
        name: 'Barry',
        length: 230.23,
        rate: 12,
      });

      const createQuery = createStoreRevision(Model, 'video');
      const query = createQuery(model, 19827091725);
      expect(query.text).toMatchSnapshot();
      expect(query.values).toEqual([
        19827091725,
        '352b2178-ee3c-11e8-9af5-00090ffe0001',
        'Barry',
        230.23,
        12,
      ]);
    });
  });

  describe('#createPromoteRevision', () => {
    it('creates a query builder based on model', () => {
      const model = Model.decode({
        id: '01837ed6-ee3e-11e8-b6f6-00090ffe0001',
        name: 'Barry',
        length: 230.23,
        rate: 12,
      });

      const createQuery = createPromoteRevision('video');

      const query = createQuery(model);
      expect(query.text).toMatchSnapshot();
      expect(query.values).toEqual(['01837ed6-ee3e-11e8-b6f6-00090ffe0001']);
    });
  });

  describe('#createRevokeRevision', () => {
    it('creates a query builder based on model', () => {
      const model = Model.decode({
        id: 'c5c2256e-ee3d-11e8-9cad-00090ffe0001',
        name: 'Barry',
        length: 230.23,
        rate: 12,
      });

      const createQuery = createRevokeRevision('video');
      const query = createQuery(model);
      expect(query.text).toMatchSnapshot();
      expect(query.values).toEqual(['c5c2256e-ee3d-11e8-9cad-00090ffe0001']);
    });
  });
});
