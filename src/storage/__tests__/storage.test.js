const uuidv4 = require('uuid/v4');
const { Client } = require('pg');
const { createModel, Field } = require('../../model');
const { float, date, int } = require('../../model/transform');
const { createSchema } = require('../../model/schema');
const { createRevisionedStorageAdapter } = require('../adapter');

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

function createBike() {
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

describe('Storage', () => {
  const db = createTestDB();

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

  describe('Storage', () => {
    let bikeFixture = createBike();

    beforeAll(async () => {
      for (const Model of [Price, Wheel, Bike]) {
        const statements = createSchema(Model);
        for (const statement of statements) {
          await db.query(statement);
        }
      }
    });

    describe('#createRevisionedStorageAdapter', () => {
      let storage;

      beforeAll(() => {
        storage = new BikeStorage(db);
      });

      it('creates a class', () => {
        expect(BikeStorage).toBeInstanceOf(Function);
      });

      describe('#fetch', () => {
        describe('when id badly formatted', () => {
          it('throws error', () => {
            expect(storage.fetch('bla-he')).rejects.toThrow();
          });
        });

        describe('when id not exists', () => {
          it('returns null', async () => {
            const result = await storage.fetch(
              '2ebcd514-ee34-11e8-80c0-00090ffe0001'
            );
            expect(result).toBe(null);
          });
        });

        describe('when id exists', () => {
          beforeEach(async () => {
            await storage.store(bikeFixture);
          });

          it('returns model for id', async () => {
            const returned = await storage.fetch(bikeFixture.id);
            expect(returned).toEqual(bikeFixture);
          });
        });
      });
    });
  });
});
