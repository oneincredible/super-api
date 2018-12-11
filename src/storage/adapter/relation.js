const { Storage } = require('../storage');

function createRelationStorageAdapter(Model, field, parentName) {
  const childName = field.StorageAdapter.getName();
  const tableName = `${parentName}_${field.name}`;

  const Query = {
    fetch(parentId) {
      return {
        text: `SELECT ${childName}_id AS id FROM ${tableName} WHERE ${parentName}_id = $1`,
        values: [parentId],
      };
    },

    add(parentId, childId) {
      return {
        text: `INSERT INTO ${tableName} (${parentName}_id, ${childName}_id) VALUES($1, $2)`,
        values: [parentId, childId],
      };
    },

    remove(parentId, childId) {
      return {
        text: `DELETE FROM ${tableName} WHERE ${parentName}_id = $1 AND ${childName}_id = $2`,
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
