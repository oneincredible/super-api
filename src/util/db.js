const uuidv4 = require('uuid/v4');
const { Client } = require('pg');
const { createModel, Field } = require('../model');
const { float, date, int } = require('../model/transform');
const { createSchema } = require('../model/schema');
const { createStorage } = require('../storage/adapter');

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

function bootstrapDB(db) {
  const Price = createModel([
    Field.value('amount', float()),
    Field.value('currency'),
  ]);

  const PriceStorage = createStorage(Price, 'price');

  const Wheel = createModel([
    Field.value('size', float()),
    Field.value('thickness', float()),
  ]);

  const WheelStorage = createStorage(Wheel, 'wheel');

  const Bike = createModel([
    Field.value('brand'),
    Field.value('wheelSize', int(10)),
    Field.value('deliveryDate', date()),
    Field.model('price', Price, PriceStorage),
    Field.list('wheels', Wheel, WheelStorage),
  ]);

  const BikeStorage = createStorage(Bike, 'bike');

  beforeAll(async () => {
    for (const StorageAdapter of [PriceStorage, WheelStorage, BikeStorage]) {
      const statements = createSchema(StorageAdapter);
      for (const statement of statements) {
        await db.query(statement);
      }
    }
  });

  return {
    models: {
      Bike,
      Price,
      Wheel,
    },
    storages: {
      BikeStorage,
      PriceStorage,
      WheelStorage,
    },
  };
}

module.exports = {
  bootstrapDB,
  createTestDB,
};
