const express = require('express');
const request = require('supertest');

const { createTestDB, bootstrapDB } = require('../../../util/db');
const {
  createBike,
  createWheel,
  models,
  storages,
} = require('../../../util/model');
const { createStorageRouter } = require('../storage');

describe('Storage Router', () => {
  const db = createTestDB();
  bootstrapDB(db);
  const bikeStorage = new storages.BikeStorage(db);
  const wheelStorage = new storages.WheelStorage(db);
  const router = createStorageRouter(models.Bike, bikeStorage);

  const app = express();
  app.use('/', router);

  describe('GET /', () => {
    describe('with malformed id', () => {
      it('responds with 400', done => {
        request(app)
          .get('/109jh1029h129h')
          .expect(400)
          .expect({ error: { message: 'Malformed UUID: 109jh1029h129h' } })
          .end(done);
      });
    });

    describe('with non-existing id', () => {
      it('responds with 404', done => {
        request(app)
          .get('/b1354cdc-efc5-11e8-9804-00090ffe0001')
          .expect(404)
          .expect({
            error: {
              message:
                'No object found for b1354cdc-efc5-11e8-9804-00090ffe0001',
            },
          })
          .end(done);
      });
    });

    describe('with existing id', () => {
      let entity;

      beforeEach(async () => {
        entity = createBike();
        await bikeStorage.store(entity);
      });

      it('responds with 200 and content', done => {
        request(app)
          .get(`/${entity.id}`)
          .expect(200)
          .expect({
            id: entity.id,
            brand: 'Crescent',
            wheelSize: 24,
            deliveryDate: '1992-02-02T00:00:00.000Z',
            price: { id: entity.price.id, amount: 2433.99, currency: 'USD' },
            wheels: [],
          })
          .end(done);
      });
    });
  });

  describe('POST /', () => {
    let bike;

    beforeEach(() => {
      bike = createBike();
    });

    describe('with complete entity', () => {
      beforeEach(done => {
        request(app)
          .post('/')
          .send(bike)
          .expect(201)
          .expect('location', `/${bike.id}`)
          .end(done);
      });

      it('can be retrieved', done => {
        request(app)
          .get(`/${bike.id}`)
          .expect(200)
          .expect({
            id: bike.id,
            brand: 'Crescent',
            wheelSize: 24,
            deliveryDate: '1992-02-02T00:00:00.000Z',
            price: { id: bike.price.id, amount: 2433.99, currency: 'USD' },
            wheels: [],
          })
          .end(done);
      });

      describe('then attaching wheel', () => {
        let wheels;

        beforeEach(async done => {
          wheels = [createWheel(), createWheel()];

          await Promise.all(wheels.map(wheel => wheelStorage.store(wheel)));

          request(app)
            .put(`/${bike.id}/wheels/${wheels[0].id}`)
            .expect(201)
            .end(done);
        });

        it('wheel has been added to bike', done => {
          request(app)
            .get(`/${bike.id}`)
            .expect(200)
            .expect(response => {
              const bike = response.body;
              expect(bike.wheels.length).toEqual(1);
              expect(bike.wheels).toContainEqual(wheels[0]);
            })
            .end(done);
        });

        describe('then attaching another wheel', () => {
          beforeEach(done => {
            request(app)
              .put(`/${bike.id}/wheels/${wheels[1].id}`)
              .expect(201)
              .end(done);
          });

          it('both wheels exists on bike', done => {
            request(app)
              .get(`/${bike.id}`)
              .expect(200)
              .expect(response => {
                const bike = response.body;
                expect(bike.wheels.length).toEqual(2);
                expect(bike.wheels).toContainEqual(wheels[0]);
                expect(bike.wheels).toContainEqual(wheels[1]);
              })
              .end(done);
          });
        });

        describe('then deleting wheel', () => {
          beforeEach(done => {
            request(app)
              .delete(`/${bike.id}/wheels/${wheels[0].id}`)
              .expect(200)
              .end(done);
          });

          it('there is no wheels on bike', done => {
            request(app)
              .get(`/${bike.id}`)
              .expect(200)
              .expect(response => {
                const bike = response.body;
                expect(bike.wheels.length).toEqual(0);
              })
              .end(done);
          });
        });
      });

      describe('then with existing id', () => {
        beforeEach(done => {
          bike.brand = 'DSB';

          request(app)
            .post('/')
            .send(bike)
            .expect(201)
            .expect('location', `/${bike.id}`)
            .end(done);
        });

        it('has been updated', done => {
          request(app)
            .get(`/${bike.id}`)
            .expect(200)
            .expect(response => {
              expect(response.body.brand).toEqual('DSB');
            })
            .end(done);
        });
      });
    });
  });
});
