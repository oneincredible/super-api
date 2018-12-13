const uuidv4 = require('uuid/v4');
const { createModel, Field } = require('../model');
const { float, date, int, password } = require('../model/transform');
const { createStorage } = require('../storage/adapter');

const Password = createModel([
  Field.value('date'),
  Field.value('hash'),
]);

const PasswordStorage = createStorage(Password, 'password');

const User = createModel([
  Field.value('name'),
  Field.model('password', Password, PasswordStorage),
]);

const UserStorage = createStorage(User, 'user');

const Session = createModel([
  Field.value('token'),
  Field.model('user', User, UserStorage),
]);

const SessionStorage = createStorage(Session, 'session');

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

const BikeOwner = createModel([
  Field.model('user', User, UserStorage),
  Field.model('bike', Bike, BikeStorage),
]);

const BikeOwnerStorage = createStorage(BikeOwner, 'bike_owner');

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
    BikeOwner,
    User,
    Wheel,
    Price,
  },
  storages: {
    PasswordStorage,
    UserStorage,
    SessionStorage,
    BikeStorage,
    BikeOwnerStorage,
    PriceStorage,
    WheelStorage,
  },
};
