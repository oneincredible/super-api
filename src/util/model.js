const uuidv4 = require('uuid/v4');
const { createModel, Field } = require('../model');
const { float, date, int } = require('../model/transform');
const { createStorage } = require('../storage/adapter');

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

function createBike() {
  return {
    id: uuidv4(),
    brand: 'Crescent',
    wheelSize: 24,
    deliveryDate: new Date('1992-02-02T00:00:00.000Z'),
    price: createPrice(),
    wheels: [],
  };
}

function createPrice() {
  return {
    id: uuidv4(),
    amount: 2433.99,
    currency: 'USD',
  };
}

function createWheel() {
  return {
    id: uuidv4(),
    size: 24.5,
    thickness: 4,
  };
}

module.exports = {
  createBike,
  createPrice,
  createWheel,
  models: {
    Bike,
    Wheel,
    Price,
  },
  storages: {
    BikeStorage,
    PriceStorage,
    WheelStorage,
  },
};
