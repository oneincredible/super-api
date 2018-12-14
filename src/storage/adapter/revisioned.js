const { Storage } = require('../storage');
const { createRelationStorageAdapter } = require('./relation');
const { Type } = require('../../model/field');
const { quote } = require('../query');

function createFetchRevision(Model, name) {
  const parentTable = name;
  const revisionTable = `${name}_revision`;

  const fields = Model.fields
    .filter(field => field.columnName)
    .map(field => `r.${quote(field.columnName)}`);

  const text = [
    'SELECT ' + fields.join(', '),
    `FROM ${quote(revisionTable)} r`,
    `JOIN ${quote(parentTable)} p ON p.id = r.id AND p.revision = r.revision`,
    'WHERE p.id = ANY($1)',
  ].join(' ');

  return function createQuery(ids) {
    return {
      text,
      values: [ids],
    };
  };
}

function createStoreRevision(Model, name) {
  const revisionTable = `${name}_revision`;

  const fields = Model.fields.filter(field => field.columnName);
  const columns = fields.map(field => field.columnName);
  const placeholders = columns.map((name, index) => '$' + (index + 1));

  const text = [
    `INSERT INTO "${revisionTable}"`,
    '(' + columns.map(quote).join(', ') + ')',
    'VALUES (' + placeholders.join(', ') + ')',
  ].join(' ');

  return function createQuery(model) {
    return {
      text,
      values: fields.map(field => field.columnValue(model)),
    };
  };
}

function createPromoteRevision(name) {
  const text = [
    `INSERT INTO "${name}" (id, revision)`,
    `SELECT id, MAX(revision) FROM "${name}_revision" WHERE id = $1 GROUP BY id`,
    'ON CONFLICT (id) DO UPDATE SET revision = excluded.revision',
  ].join(' ');

  return function createQuery(model) {
    return {
      text,
      values: [model.id],
    };
  };
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

    async fetch(modelId) {
      const result = await this.db.query(Query.fetchRevision([modelId]));
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

      return model;
    }

    async store(model) {
      await Promise.all(
        modelFields.map(({ name }) => {
          return this.composed[name].store(model[name]);
        })
      );

      try {
        await this.db.query('BEGIN');

        const revision = Date.now();
        await this.db.query(Query.storeRevision(model, revision));
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
