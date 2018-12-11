const { Storage } = require('../storage');

function createRelationStorageAdapter(Model, field) {
  const tableName = `${Model.name}_${field.name}`;
  const parent = Model.name;
  const child = field.Model.name;

  const Query = {
    fetch(parentId) {
      return {
        text: `SELECT ${child}_id AS id FROM ${tableName} WHERE ${parent}_id = $1`,
        values: [parentId],
      };
    },

    add(parentId, childId) {
      return {
        text: `INSERT INTO ${tableName} (${parent}_id, ${child}_id) VALUES($1, $2)`,
        values: [parentId, childId],
      };
    },

    remove(parentId, childId) {
      return {
        text: `DELETE FROM ${tableName} WHERE ${parent}_id = $1 AND ${child}_id = $2`,
        values: [parentId, childId],
      };
    },
  };

  class RelationStorageAdapter extends Storage {
    constructor(db) {
      super(db);
      this.storage = new field.StorageAdapter(db);
    }

    async fetch(parentId) {
      const result = await this.db.query(Query.fetch(parentId));
      return await Promise.all(
        result.rows.map(row => this.storage.fetch(row.id))
      );
    }

    add(parentId, relationId) {
      return this.db.query(Query.add(parentId, relationId));
    }

    remove(parentId, relationId) {
      return this.db.query(Query.remove(parentId, relationId));
    }
  }

  return RelationStorageAdapter;
}

module.exports = {
  createRelationStorageAdapter,
};
