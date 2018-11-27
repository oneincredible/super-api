const { noop } = require('./transform');

function toSnakeCase(pascalCase) {
  return pascalCase
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
}

const Type = {
  VALUE: Symbol('value field'),
  LIST: Symbol('list field'),
  MODEL: Symbol('model field'),
};

function value(name, transform = noop) {
  return {
    type: Type.VALUE,
    name,

    encode: transform.encode,
    decode: transform.decode,

    columnName: toSnakeCase(name),
    columnValue(model) {
      return model[name];
    },
  };
}

function list(name, Model, StorageAdapter) {
  return {
    type: Type.LIST,
    name,

    encode: values => (values ? values.map(Model.encode) : null),
    decode: values => (values ? values.map(Model.decode) : null),

    Model,
    StorageAdapter,
  };
}

function model(name, Model, StorageAdapter) {
  return {
    type: Type.MODEL,
    name,

    encode: Model.encode,
    decode: Model.decode,

    columnName: `${toSnakeCase(name)}_id`,
    columnValue(model) {
      return model[name].id;
    },

    Model,
    StorageAdapter,
  };
}

module.exports = {
  Type,
  value,
  list,
  model,
};
