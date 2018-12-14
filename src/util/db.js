const uuidv4 = require('uuid/v4');
const { Client } = require('pg');
const { createSchema } = require('../model/schema');
const { storages } = require('./model');

function createTestDB() {
  const DB_NAME = uuidv4();

  const db = new Client({
    database: DB_NAME,
  });

  let createDB;

  beforeAll(async () => {
    createDB = new Client({
      database: 'postgres',
    });

    createDB.connect();

    await createDB.query(`CREATE DATABASE "${DB_NAME}";`);
    db.connect();
  });

  bootstrapDB(db);

  afterAll(async () => {
    await db.end();
    await createDB.query(`DROP DATABASE "${DB_NAME}";`);
    await createDB.end();
  });

  return db;
}

function bootstrapDB(db) {
  const {
    PasswordStorage,
    UserStorage,
    SessionStorage,
    BikeOwnerStorage,
    PriceStorage,
    WheelStorage,
    BikeStorage,
  } = storages;

  beforeAll(async () => {
    for (const StorageAdapter of [
      PasswordStorage,
      UserStorage,
      SessionStorage,
      PriceStorage,
      WheelStorage,
      BikeStorage,
      BikeOwnerStorage,
    ]) {
      const statements = createSchema(StorageAdapter);
      for (const statement of statements) {
        await db.query(statement);
      }
    }
  });
}

module.exports = {
  createTestDB,
};
