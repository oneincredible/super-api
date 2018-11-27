const uuidv4 = require('uuid/v4');
const { Client } = require('pg')
const { createModel, Field } = require('../../model');
const { float, date, int } = require('../../model/transform');
const { createSchema } = require('../../model/schema');

describe('Storage', () => {
  const Price = createModel(
    [Field.value('amount', float()), Field.value('currency')],
    'price'
  );

  const Wheel = createModel(
    [Field.value('size', float()), Field.value('thickness', float())],
    'wheel'
  );

  const Bike = createModel(
    [
      Field.value('brand'),
      Field.value('wheelSize', int(10)),
      Field.value('deliveryDate', date()),
      Field.model('price', Price),
      Field.list('wheels', Wheel),
    ],
    'bike'
  );

  const DB_NAME = uuidv4();

  let createDB, db;

  beforeAll(async () => {
    createDB = new Client({
      database: 'postgres',
    });

    createDB.connect();

    await createDB.query(`CREATE DATABASE "${DB_NAME}";`);

    db = new Client({
      database: DB_NAME,
    });

    db.connect();
  });

  afterAll(async () => {
    await db.end();
    await createDB.query(`DROP DATABASE "${DB_NAME}";`);
    await createDB.end();
  });

  describe('Storage', () => {
    beforeAll(async () => {
      for (const Model of [Price, Wheel, Bike]) {
        const statements = createSchema(Model);
        for (const statement of statements) {
          await db.query(statement);
        }
      }
    });

    it('does a thing', () => {
      expect(true).toBe(true);
    });
  });
});
