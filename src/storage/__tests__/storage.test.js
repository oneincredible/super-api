const { createTestDB, bootstrapDB } = require('../../util/db');
const { createBike, createPrice, storages } = require('../../util/model');
const { Storage } = require('../storage');

describe('Storage', () => {
  const db = createTestDB();
  bootstrapDB(db);

  describe('Storage', () => {
    let bike;
    let storage;

    beforeAll(() => {
      storage = new storages.BikeStorage(db);
    });

    beforeEach(() => {
      bike = createBike();
    });

    it('provides interface for composed Models', () => {
      expect(storage.composed.price).toBeInstanceOf(Storage);
    });

    it('provides interface for related Models', () => {
      expect(storage.relations.wheels).toBeInstanceOf(Storage);
    });

    describe('revisions', () => {
      it('are created sequentially', async () => {
        const storage = new storages.PriceStorage(db);
        const price = createPrice();

        const jobs = [];
        for (let i = 0; i < 100; i++) {
          jobs.push(storage.store(price));
        }

        await Promise.all(jobs);

        const res = await db.query(
          'SELECT * FROM price_revision WHERE id = $1',
          [price.id]
        );

        expect(res.rowCount).toEqual(100);
      });
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
          await storage.store(bike);
        });

        it('returns model for id', async () => {
          const returned = await storage.fetch(bike.id);
          expect(returned).toEqual(bike);
        });
      });
    });

    describe('#store', () => {
      beforeEach(async () => {
        await storage.store(bike);
      });

      it('makes object retrievable', async () => {
        const model = await storage.fetch(bike.id);
        expect(model).toEqual({
          brand: 'Crescent',
          deliveryDate: new Date('1992-02-02T00:00:00.000Z'),
          id: bike.id,
          price: {
            amount: 2433.99,
            currency: 'USD',
            id: bike.price.id,
          },
          wheelSize: 24,
          wheels: [],
        });
      });

      describe('when storing object again', () => {
        beforeEach(async () => {
          bike.brand = 'DSB';
          bike.price.currency = 'SEK';
          await storage.store(bike);
        });

        it('has saved updated object', async () => {
          const model = await storage.fetch(bike.id);
          expect(model).toEqual({
            brand: 'DSB',
            deliveryDate: new Date('1992-02-02T00:00:00.000Z'),
            id: bike.id,
            price: {
              amount: 2433.99,
              currency: 'SEK',
              id: bike.price.id,
            },
            wheelSize: 24,
            wheels: [],
          });
        });
      });
    });
  });
});
