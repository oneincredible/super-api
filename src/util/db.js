const uuidv4 = require('uuid/v4');
const { Client } = require('pg');
const { createModel, Field } = require('../model');
const { float, date, int } = require('../model/transform');
const { createSchema } = require('../model/schema');
const { createRevisionedStorageAdapter } = require('../storage/adapter');

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
  function createEntity() {
    return {
      id: uuidv4(),
      brand: 'Crescent',
      wheelSize: 24,
      deliveryDate: new Date('1992-02-02T00:00:00.000Z'),
      price: {
        id: uuidv4(),
        amount: 2433.99,
        currency: 'USD',
      },
      wheels: [],
    };
  }

  const Price = createModel(
    [Field.value('amount', float()), Field.value('currency')],
    'price'
  );

  const PriceStorage = createRevisionedStorageAdapter(Price);

  const Wheel = createModel(
    [Field.value('size', float()), Field.value('thickness', float())],
    'wheel'
  );

  const WheelStorage = createRevisionedStorageAdapter(Wheel);

  const Bike = createModel(
    [
      Field.value('brand'),
      Field.value('wheelSize', int(10)),
      Field.value('deliveryDate', date()),
      Field.model('price', Price, PriceStorage),
      Field.list('wheels', Wheel, WheelStorage),
    ],
    'bike'
  );

  const BikeStorage = createRevisionedStorageAdapter(Bike);

  beforeAll(async () => {
    for (const Model of [Price, Wheel, Bike]) {
      const statements = createSchema(Model);
      for (const statement of statements) {
        await db.query(statement);
      }
    }
  });

  return {
    createEntity,
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
