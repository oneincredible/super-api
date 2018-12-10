const uuidv4 = require('uuid/v4');

function createBike() {
  return {
    id: uuidv4(),
    brand: 'Crescent',
    wheelSize: 24,
    deliveryDate: new Date('1992-02-02T00:00:00.000Z'),
    price: null,
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

function createWheel() {}

module.exports = {
  createBike,
  createPrice,
  createWheel,
};
