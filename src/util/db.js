const uuidv4 = require('uuid/v4');
const { Client } = require('pg');

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

  afterAll(async () => {
    await db.end();
    await createDB.query(`DROP DATABASE "${DB_NAME}";`);
    await createDB.end();
  });

  return db;
}

module.exports = {
  createTestDB,
};
