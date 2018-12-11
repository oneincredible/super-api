const { createSchema } = require('../schema');
const { storages } = require('../../util/model');

describe('Schema generation', () => {
  Object.values(storages).forEach(StorageAdapter => {
    describe(StorageAdapter.getName(), () => {
      it('generates expected schema', () => {
        const statements = createSchema(StorageAdapter);
        statements.forEach(statement => {
          expect(statement).toMatchSnapshot();
        });
      });
    });
  });
});
