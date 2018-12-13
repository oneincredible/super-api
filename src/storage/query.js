function quote(name) {
  return `"${name}"`;
}

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
    'WHERE p.id = $1',
  ].join(' ');

  return function createQuery(id) {
    return {
      text,
      values: [id],
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

function createRevokeRevision(name) {
  const text = `DELETE FROM "${name}" WHERE id = $1`;

  return function createQuery(model) {
    return {
      text,
      values: [model.id],
    };
  };
}

module.exports = {
  quote,
  createFetchRevision,
  createStoreRevision,
  createPromoteRevision,
  createRevokeRevision,
};
