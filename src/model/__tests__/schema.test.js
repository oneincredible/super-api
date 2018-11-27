const { createModel, Field } = require('..');
const { float, date, int } = require('../transform');
const { createSchema } = require('../schema');

describe('Schema generation', () => {
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

  [Price, Wheel, Bike].forEach(Model => {
    describe(Model.name, () => {
      it('generates expected schema', () => {
        const statements = createSchema(Model);
        statements.forEach(statement => {
          expect(statement).toMatchSnapshot();
        });
      });
    });
  });
});
