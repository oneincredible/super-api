const { createModel, Field } = require('..');
const { float, date, int } = require('../transform');
const { createSchema } = require('../schema');
const { createStorage } = require('../../storage');

describe('Schema generation', () => {
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

  [PriceStorage, WheelStorage, BikeStorage].forEach(StorageAdapter => {
    describe(StorageAdapter.getName(), () => {
      it('generates expected schema', () => {
        const statements = createSchema(StorageAdapter);
        statements.forEach(statement => {
          expect(statement).toMatchSnapshot();
        });
      });
    });
  });
});
