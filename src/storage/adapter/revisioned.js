const { Storage } = require('../storage');
const { createRelationStorageAdapter } = require('./relation');
const {
  createPromoteRevision,
  createFetchRevision,
  createStoreRevision,
} = require('../query');
const { Type } = require('../../model/field');

function noop(value) {
  return value;
}

function createRevisionedStorageAdapter(Model, name) {
  const tableName = name;
  const valueFields = Model.fields.filter(field => field.type === Type.VALUE);
  const listFields = Model.fields.filter(field => field.type === Type.LIST);
  const modelFields = Model.fields.filter(field => field.type === Type.MODEL);

  function createComposedStorage(db) {
    const composed = Object.create(null);
    for (const { name, StorageAdapter } of modelFields) {
      composed[name] = new StorageAdapter(db);
    }
    return composed;
  }

  function createRelationsStorage(db) {
    const relations = Object.create(null);
    for (const field of listFields) {
      const RelationsStorageAdapter = createRelationStorageAdapter(
        Model,
        field,
        name
      );
      relations[field.name] = new RelationsStorageAdapter(db);
    }
    return relations;
  }

  const Query = {
    fetchRevision: createFetchRevision(Model, tableName),
    storeRevision: createStoreRevision(Model, tableName),
    promoteRevision: createPromoteRevision(tableName),
  };

  class RevisionedStorageAdapter extends Storage {
    static getName() {
      return name;
    }

    static getModel() {
      return Model;
    }

    constructor(db) {
      super(db);
      this.composed = createComposedStorage(db);
      this.relations = createRelationsStorage(db);
    }

    async fetch(modelId, prepare = noop) {
      const result = await this.db.query(Query.fetchRevision(modelId));
      if (result.rowCount === 0) {
        return null;
      }

      const row = result.rows[0];
      const model = {};
      for (const field of valueFields) {
        model[field.name] = row[field.columnName];
      }

      await Promise.all([
        ...modelFields.map(async ({ name, columnName }) => {
          model[name] = await this.composed[name].fetch(row[columnName]);
        }),
        ...listFields.map(async ({ name }) => {
          model[name] = await this.relations[name].fetch(model.id);
        }),
      ]);

      return prepare(model);
    }

    async store(model) {
      await Promise.all(
        modelFields.map(({ name }) => {
          return this.composed[name].store(model[name]);
        })
      );

      try {
        await this.db.query('BEGIN');

        await this.db.query(Query.storeRevision(model));
        await this.db.query(Query.promoteRevision(model));

        await this.db.query('COMMIT');
      } catch (error) {
        await this.db.query('ROLLBACK');
        throw error;
      }
    }
  }

  return RevisionedStorageAdapter;
}

module.exports = {
  createRevisionedStorageAdapter,
};
